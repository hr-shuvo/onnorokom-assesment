using System.Data;
using Domain.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Services.Interfaces;
using Domain.Settings;
using Framework.Exceptions;
using Framework.Repositories;
using Framework.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Domain.Services;

public class AdmissionHoldService : BaseService<AdmissionHold>, IAdmissionHoldService
{
    private readonly IBaseRepository<AcademicClass> _classRepository;
    private readonly ISettingsService<AdmissionSettings> _admissionSettings;
    private readonly IConfiguration _configuration;

    public AdmissionHoldService(
        IBaseRepository<AdmissionHold> repository,
        IBaseRepository<AcademicClass> classRepository,
        ISettingsService<AdmissionSettings> admissionSettings,
        IConfiguration configuration) : base(repository)
    {
        _classRepository = classRepository;
        _admissionSettings = admissionSettings;
        _configuration = configuration;
    }

    private TimeSpan GetHoldDuration(int fallbackMinutes)
    {
        var raw = _configuration["HOLD_DURATION_SECONDS"];
        if (!string.IsNullOrWhiteSpace(raw) && int.TryParse(raw, out var seconds) && seconds > 0)
        {
            return TimeSpan.FromSeconds(seconds);
        }

        return TimeSpan.FromMinutes(fallbackMinutes);
    }

    public async Task<int> GetAvailableSeatsAsync(long classId)
    {
        var (availableSeats, _) = await GetSeatSummaryAsync(classId);
        return availableSeats;
    }

    public async Task<(int AvailableSeats, int ConfirmedSeats)> GetSeatSummaryAsync(long classId)
    {
        var academicClass = await _classRepository.Get(classId)
                            ?? throw new NotFoundException($"AcademicClass with id {classId} was not found.");

        var now = DateTime.UtcNow;

        var seatCounts = await Query()
            .Where(x => x.ClassId == classId)
            .GroupBy(x => x.ClassId)
            .Select(g => new
            {
                ConfirmedSeats = g.Count(x => x.Status == HoldStatus.Confirmed),
                HeldSeats = g.Count(x => x.Status == HoldStatus.Held && x.ExpiresAt > now)
            })
            .FirstOrDefaultAsync();

        var confirmedSeats = seatCounts?.ConfirmedSeats ?? 0;
        var heldSeats = seatCounts?.HeldSeats ?? 0;

        return (academicClass.TotalSeats - confirmedSeats - heldSeats, confirmedSeats);
    }

    public async Task<(int Count, IEnumerable<AdmissionHold> Items)> LoadByClassAsync(long classId, AdminHoldQueryParams queryParams)
    {
        _ = await _classRepository.Get(classId)
            ?? throw new NotFoundException($"AcademicClass with id {classId} was not found.");

        var query = Query().Where(x => x.ClassId == classId);

        if (queryParams.Status.HasValue)
        {
            query = query.Where(x => x.Status == queryParams.Status.Value);
        }

        query = query.OrderByDescending(x => x.CreatedAt);

        return await LoadAsync(query, queryParams.PageNumber, queryParams.PageSize);
    }

    public async Task<bool> HasActiveApplicationAsync(string studentId)
    {
        return await GetActiveHoldAsync(studentId) != null;
    }

    public async Task<AdmissionHold> GetActiveHoldAsync(string studentId)
    {
        return await Query()
            .Where(x => x.StudentId == studentId)
            .Where(x => x.Status == HoldStatus.Waiting
                        || x.Status == HoldStatus.Held
                        || x.Status == HoldStatus.Confirmed)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<AdmissionHold>> GetHoldsForStudentAsync(string studentId)
    {
        return await Query()
            .Where(x => x.StudentId == studentId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task ExpireAndPromoteAsync(long classId)
    {
        await ExpireHeldHoldsAsync(classId);

        var academicClass = await _classRepository.Get(classId)
                            ?? throw new NotFoundException($"AcademicClass with id {classId} was not found.");

        var admission = await _admissionSettings.GetAsync();

        if (!academicClass.IsActive || !IsAdmissionOpen(admission, DateTime.UtcNow))
        {
            await CancelWaitlistAsync(classId);
            return;
        }

        await PromoteWaitlistAsync(classId, admission);
    }

    // making status expired
    private async Task ExpireHeldHoldsAsync(long classId)
    {
        var now = DateTime.UtcNow;

        var expiredHolds = await Query()
            .Where(x => x.ClassId == classId && x.Status == HoldStatus.Held && x.ExpiresAt <= now)
            .ToListAsync();

        foreach (var hold in expiredHolds)
        {
            hold.Status = HoldStatus.Expired;
        }

        await UpdateRangeAsync(expiredHolds);
    }

    // making status cancel
    private async Task CancelWaitlistAsync(long classId)
    {
        var waitingHolds = await Query()
            .Where(x => x.ClassId == classId && x.Status == HoldStatus.Waiting)
            .ToListAsync();

        foreach (var hold in waitingHolds)
        {
            hold.Status = HoldStatus.Cancelled;
        }

        await UpdateRangeAsync(waitingHolds);
    }

    private async Task PromoteWaitlistAsync(long classId, AdmissionSettings admission)
    {
        var availableSeats = await GetAvailableSeatsAsync(classId);

        if (availableSeats <= 0)
        {
            return;
        }

        var now = DateTime.UtcNow;

        var promotable = await Query()
            .Where(x => x.ClassId == classId && x.Status == HoldStatus.Waiting)
            .OrderBy(x => x.CreatedAt)
            .Take(availableSeats)
            .ToListAsync();

        foreach (var hold in promotable)
        {
            hold.Status = HoldStatus.Held;
            hold.ExpiresAt = now.Add(GetHoldDuration(admission.WaitlistHoldMinutes));
        }

        await UpdateRangeAsync(promotable);
    }

    public async Task<AdmissionHold> ApplyAsync(long classId, string studentId, string studentName,
        string guardianPhone)
    {
        await using var transaction = await BeginTransactionAsync(IsolationLevel.Serializable);

        try
        {
            var hold = await ApplyCoreAsync(classId, studentId, studentName, guardianPhone);
            await transaction.CommitAsync();
            return hold;
        }
        catch (PostgresException)
        {
            throw new ConflictException("Another request modified this class at the same time. Please try again.");
        }
    }

    private async Task<AdmissionHold> ApplyCoreAsync(long classId, string studentId, string studentName,
        string guardianPhone)
    {
        var (_, admission) = await GetOpenClassOrThrowAsync(classId);

        await ExpireAndPromoteAsync(classId);

        if (await HasActiveApplicationAsync(studentId))
        {
            throw new ConflictException("This student already has an active application.");
        }

        var availableSeats = await GetAvailableSeatsAsync(classId);

        if (availableSeats <= 0)
        {
            throw new ConflictException("This class has no seats remaining.");
        }

        var hold = new AdmissionHold
        {
            StudentId = studentId,
            StudentName = studentName,
            GuardianPhone = guardianPhone,
            ClassId = classId,
            Status = HoldStatus.Held,
            ExpiresAt = DateTime.UtcNow.Add(GetHoldDuration(admission.HoldMinutes))
        };

        await CreateAsync(hold);

        return hold;
    }

    public async Task<AdmissionHold> JoinWaitlistAsync(long classId, string studentId, string studentName,
        string guardianPhone)
    {
        await using var transaction = await BeginTransactionAsync(IsolationLevel.Serializable);

        try
        {
            var hold = await JoinWaitlistCoreAsync(classId, studentId, studentName, guardianPhone);
            await transaction.CommitAsync();
            return hold;
        }
        catch (PostgresException)
        {
            throw new ConflictException("Another request modified this class at the same time. Please try again.");
        }
    }

    private async Task<AdmissionHold> JoinWaitlistCoreAsync(long classId, string studentId, string studentName,
        string guardianPhone)
    {
        await GetOpenClassOrThrowAsync(classId);

        await ExpireAndPromoteAsync(classId);

        if (await HasActiveApplicationAsync(studentId))
        {
            throw new ConflictException("This student already has an active application.");
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

        await CreateAsync(hold);

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

        await using var transaction = await BeginTransactionAsync(IsolationLevel.Serializable);

        try
        {
            var confirmed = await ConfirmCoreAsync(holdId, hold.ClassId);
            await transaction.CommitAsync();
            return confirmed;
        }
        catch (PostgresException)
        {
            throw new ConflictException("Another request modified this class at the same time. Please try again.");
        }
    }

    public async Task<AdmissionHold> CancelAsync(long holdId, string studentId)
    {
        var hold = await Query()
                       .FirstOrDefaultAsync(x => x.Id == holdId)
                   ?? throw new NotFoundException($"AdmissionHold with id {holdId} was not found.");

        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("This hold does not belong to this student.");
        }

        if (hold.Status is HoldStatus.Cancelled or HoldStatus.Expired)
        {
            return hold;
        }

        if (hold.Status == HoldStatus.Confirmed)
        {
            throw new ConflictException("This admission has already been confirmed and cannot be cancelled.");
        }

        await using var transaction = await BeginTransactionAsync(IsolationLevel.Serializable);

        try
        {
            var cancelled = await CancelCoreAsync(holdId, hold.ClassId);
            await transaction.CommitAsync();
            return cancelled;
        }
        catch (PostgresException)
        {
            throw new ConflictException("Another request modified this class at the same time. Please try again.");
        }
    }

    #region Private Methods

    private async Task<AdmissionHold> CancelCoreAsync(long holdId, long classId)
    {
        var hold = await Query()
                       .FirstOrDefaultAsync(x => x.Id == holdId)
                   ?? throw new NotFoundException($"AdmissionHold with id {holdId} was not found.");

        if (hold.Status is HoldStatus.Cancelled or HoldStatus.Expired or HoldStatus.Confirmed)
        {
            return hold;
        }

        hold.Status = HoldStatus.Cancelled;
        await UpdateAsync(hold);

        // Freed-up seat (if this was a Held hold) is picked up by the usual FCFS waitlist promotion.
        await ExpireAndPromoteAsync(classId);

        return hold;
    }

    private async Task<AdmissionHold> ConfirmCoreAsync(long holdId, long classId)
    {
        await ExpireAndPromoteAsync(classId);

        var hold = await Query()
                       .FirstOrDefaultAsync(x => x.Id == holdId)
                   ?? throw new NotFoundException($"AdmissionHold with id {holdId} was not found.");

        if (hold.Status == HoldStatus.Confirmed)
        {
            return hold;
        }

        if (hold.Status != HoldStatus.Held)
        {
            throw new ConflictException("This hold has expired.");
        }

        hold.Status = HoldStatus.Confirmed;
        hold.ConfirmedAt = DateTime.UtcNow;

        await UpdateAsync(hold);

        return hold;
    }

    private async Task<(AcademicClass Class, AdmissionSettings Admission)> GetOpenClassOrThrowAsync(long classId)
    {
        var academicClass = await _classRepository.Get(classId)
                            ?? throw new NotFoundException($"AcademicClass with id {classId} was not found.");

        var admission = await _admissionSettings.GetAsync();

        if (!academicClass.IsActive || !IsAdmissionOpen(admission, DateTime.UtcNow))
        {
            throw new ConflictException("This class is not currently open for admission.");
        }

        return (academicClass, admission);
    }

    private static bool IsAdmissionOpen(AdmissionSettings admission, DateTime now) =>
        admission is { IsPublished: true } && admission.OpensAt <= now && admission.ClosesAt > now;

    #endregion
}