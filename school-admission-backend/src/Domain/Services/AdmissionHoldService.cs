using Domain.Entities;
using Domain.Services.Interfaces;
using Framework.Repositories;
using Framework.Services;

namespace Domain.Services;

public class AdmissionHoldService : BaseService<AdmissionHold>, IAdmissionHoldService
{
    public AdmissionHoldService(IBaseRepository<AdmissionHold> repository) : base(repository)
    {
    }
}