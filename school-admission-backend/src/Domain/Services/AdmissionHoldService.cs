using Domain.Entities;
using Domain.Enums;
using Domain.Services.Interfaces;
using Framework.Exceptions;
using Framework.Repositories;
using Framework.Services;
using Microsoft.EntityFrameworkCore;

namespace Domain.Services;

public class AdmissionHoldService : BaseService<AdmissionHold>, IAdmissionHoldService
{
    private readonly IBaseRepository<AcademicClass> _classRepository;
    private readonly IBaseRepository<Admission> _admissionRepository;

    public AdmissionHoldService(
        IBaseRepository<AdmissionHold> repository,
        IBaseRepository<AcademicClass> classRepository,
        IBaseRepository<Admission> admissionRepository) : base(repository)
    {
        _classRepository = classRepository;
        _admissionRepository = admissionRepository;
    }

    public async Task<int> GetAvailableSeatsAsync(long classId)
    {
        var academicClass = await _classRepository.Get(classId)
            ?? throw new NotFoundException($"AcademicClass with id {classId} was not found.");

        var now = DateTime.UtcNow;

        var takenSeats = await Query()
            .Where(x => x.ClassId == classId)
            .Where(x => x.Status == HoldStatus.Confirmed
                        || (x.Status == HoldStatus.Held && x.ExpiresAt > now))
            .CountAsync();

        return academicClass.TotalSeats - takenSeats;
    }

    public async Task<bool> HasActiveApplicationAsync(string studentId)
    {
        return await Query()
            .Where(x => x.StudentId == studentId)
            .Where(x => x.Status == HoldStatus.Waiting
                        || x.Status == HoldStatus.Held
                        || x.Status == HoldStatus.Confirmed)
            .AnyAsync();
    }

    public async Task ExpireAndPromoteAsync(long classId)
    {
        var now = DateTime.UtcNow;

        var expiredHolds = await Query()
            .Where(x => x.ClassId == classId && x.Status == HoldStatus.Held && x.ExpiresAt <= now)
            .ToListAsync();

        foreach (var hold in expiredHolds)
        {
            hold.Status = HoldStatus.Expired;
            await UpdateAsync(hold);
        }

        var academicClass = await _classRepository.Get(classId)
            ?? throw new NotFoundException($"AcademicClass with id {classId} was not found.");

        var publishedAdmission = await _admissionRepository
            .Get(x => x.Status == AdmissionStatus.Published);

        var admissionClosed = publishedAdmission is null || publishedAdmission.ClosesAt <= now;

        if (!academicClass.IsActive || admissionClosed)
        {
            var waitingHolds = await Query()
                .Where(x => x.ClassId == classId && x.Status == HoldStatus.Waiting)
                .ToListAsync();

            foreach (var hold in waitingHolds)
            {
                hold.Status = HoldStatus.Cancelled;
                await UpdateAsync(hold);
            }

            return;
        }

        var availableSeats = await GetAvailableSeatsAsync(classId);

        if (availableSeats <= 0)
        {
            return;
        }

        var waitlistHoldMinutes = publishedAdmission?.WaitlistHoldMinutes ?? 30;

        var promotable = await Query()
            .Where(x => x.ClassId == classId && x.Status == HoldStatus.Waiting)
            .OrderBy(x => x.CreatedAt)
            .Take(availableSeats)
            .ToListAsync();

        foreach (var hold in promotable)
        {
            hold.Status = HoldStatus.Held;
            hold.ExpiresAt = now.AddMinutes(waitlistHoldMinutes);
            await UpdateAsync(hold);
        }
    }
}
