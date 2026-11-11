using Domain.Dtos;
using Domain.Entities;
using Framework.Services;

namespace Domain.Services.Interfaces;

public interface IAdmissionHoldService : IBaseService<AdmissionHold>
{
    Task<int> GetAvailableSeatsAsync(long classId);
    Task<(int AvailableSeats, int ConfirmedSeats)> GetSeatSummaryAsync(long classId);
    Task<bool> HasActiveApplicationAsync(string studentId);
    Task<AdmissionHold> GetActiveHoldAsync(string studentId);
    Task<IEnumerable<AdmissionHold>> GetHoldsForStudentAsync(string studentId);
    Task ExpireAndPromoteAsync(long classId);
    Task<AdmissionHold> ApplyAsync(long classId, string studentId, string studentName, string guardianPhone);
    Task<AdmissionHold> JoinWaitlistAsync(long classId, string studentId, string studentName, string guardianPhone);
    Task<AdmissionHold> ConfirmAsync(long holdId, string studentId);
    Task<AdmissionHold> CancelAsync(long holdId, string studentId);
    Task<(int Count, IEnumerable<AdmissionHold> Items)> LoadByClassAsync(long classId, AdminHoldQueryParams queryParams);
}
