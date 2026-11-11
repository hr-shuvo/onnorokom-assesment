using Domain.Entities;
using Domain.Enums;
using Domain.Services.Interfaces;
using Domain.Settings;
using Framework.Exceptions;
using Framework.Repositories;
using Framework.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Domain.Services;

public class AdmissionHoldService : BaseService<AdmissionHold>, IAdmissionHoldService
{
    private readonly IBaseRepository<AcademicClass> _classRepository;
    private readonly ISettingsService<AdmissionSettings> _admissionSettings;
    private readonly DbContext _dbContext;

    public AdmissionHoldService(
        IBaseRepository<AdmissionHold> repository,
        IBaseRepository<AcademicClass> classRepository,
        ISettingsService<AdmissionSettings> admissionSettings,
        DbContext dbContext) : base(repository)
    {
        _classRepository = classRepository;
        _admissionSettings = admissionSettings;
        _dbContext = dbContext;
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

        var admission = await _admissionSettings.GetAsync();

        if (!academicClass.IsActive || !IsAdmissionOpen(admission, now))
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

        var promotable = await Query()
            .Where(x => x.ClassId == classId && x.Status == HoldStatus.Waiting)
            .OrderBy(x => x.CreatedAt)
            .Take(availableSeats)
            .ToListAsync();

        foreach (var hold in promotable)
        {
            hold.Status = HoldStatus.Held;
            hold.ExpiresAt = now.AddMinutes(admission.WaitlistHoldMinutes);
            await UpdateAsync(hold);
        }
    }

    public async Task<AdmissionHold> ApplyAsync(long classId, string studentId, string studentName, string guardianPhone)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        await LockClassRowAsync(classId);

        var (_, admission) = await GetOpenClassOrThrowAsync(classId);

        await ExpireAndPromoteAsync(classId);

        if (await HasActiveApplicationAsync(studentId))
        {
            throw new ConflictException("ALREADY_HAS_ACTIVE_APPLICATION");
        }

        var availableSeats = await GetAvailableSeatsAsync(classId);

        if (availableSeats <= 0)
        {
            throw new ConflictException("SEATS_FULL");
        }

        var hold = new AdmissionHold
        {
            StudentId = studentId,
            StudentName = studentName,
            GuardianPhone = guardianPhone,
            ClassId = classId,
            Status = HoldStatus.Held,
            ExpiresAt = DateTime.UtcNow.AddMinutes(admission.HoldMinutes)
        };

        await InsertHoldAsync(hold);

        await transaction.CommitAsync();

        return hold;
    }

    public async Task<AdmissionHold> JoinWaitlistAsync(long classId, string studentId, string studentName, string guardianPhone)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        await LockClassRowAsync(classId);

        await GetOpenClassOrThrowAsync(classId);

        await ExpireAndPromoteAsync(classId);

        if (await HasActiveApplicationAsync(studentId))
        {
            throw new ConflictException("ALREADY_HAS_ACTIVE_APPLICATION");
        }

        var hold = new AdmissionHold
        {
            StudentId = studentId,
            StudentName = studentName,
            GuardianPhone = guardianPhone,
            ClassId = classId,
            Status = HoldStatus.Waiting,
            ExpiresAt = null
        };

        await InsertHoldAsync(hold);

        await transaction.CommitAsync();

        return hold;
    }

    public async Task<AdmissionHold> ConfirmAsync(long holdId, string studentId)
    {
        var hold = await Query()
            .FirstOrDefaultAsync(x => x.Id == holdId)
            ?? throw new NotFoundException($"AdmissionHold with id {holdId} was not found.");

        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("This hold does not belong to this student.");
        }

        if (hold.Status == HoldStatus.Confirmed)
        {
            return hold;
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        await LockClassRowAsync(hold.ClassId);

        await ExpireAndPromoteAsync(hold.ClassId);

        hold = await Query()
            .FirstOrDefaultAsync(x => x.Id == holdId)
            ?? throw new NotFoundException($"AdmissionHold with id {holdId} was not found.");

        if (hold.Status == HoldStatus.Confirmed)
        {
            await transaction.CommitAsync();
            return hold;
        }

        if (hold.Status != HoldStatus.Held)
        {
            throw new ConflictException("HOLD_EXPIRED");
        }

        hold.Status = HoldStatus.Confirmed;
        hold.ConfirmedAt = DateTime.UtcNow;

        await UpdateAsync(hold);

        await transaction.CommitAsync();

        return hold;
    }

    

    private async Task<(AcademicClass Class, AdmissionSettings Admission)> GetOpenClassOrThrowAsync(long classId)
    {
        var academicClass = await _classRepository.Get(classId)
            ?? throw new NotFoundException($"AcademicClass with id {classId} was not found.");

        var admission = await _admissionSettings.GetAsync();

        if (!academicClass.IsActive || !IsAdmissionOpen(admission, DateTime.UtcNow))
        {
            throw new ConflictException("CLASS_NOT_OPEN");
        }

        return (academicClass, admission);
    }

    private async Task InsertHoldAsync(AdmissionHold hold)
    {
        try
        {
            await CreateAsync(hold);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            throw new ConflictException("ALREADY_HAS_ACTIVE_APPLICATION");
        }
    }

    private Task LockClassRowAsync(long classId) =>
        _dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT 1 FROM \"AcademicClass\" WHERE \"Id\" = {classId} FOR UPDATE");

    private static bool IsAdmissionOpen(AdmissionSettings admission, DateTime now) =>
        admission is { IsPublished: true } && admission.OpensAt <= now && admission.ClosesAt > now;

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}
