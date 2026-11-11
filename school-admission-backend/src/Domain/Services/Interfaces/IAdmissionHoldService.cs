using Domain.Entities;
using Framework.Services;

namespace Domain.Services.Interfaces;

public interface IAdmissionHoldService : IBaseService<AdmissionHold>
{
    Task<int> GetAvailableSeatsAsync(long classId);
    Task<bool> HasActiveApplicationAsync(string studentId);
    Task ExpireAndPromoteAsync(long classId);
}
