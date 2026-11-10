using Domain.Dtos;
using Domain.Entities;
using Domain.Enums;
using Framework.Services;

namespace Domain.Services.Interfaces;

public interface IAdmissionService : IBaseService<Admission>
{
    Task<(int Count, IEnumerable<AdmissionDto> Items)> LoadAsync(AdmissionQueryParams queryParams);
    Task<AdmissionDto> GetAsync(long id);
    Task<AdmissionDto> SaveAsync(AdmissionVm model);
    Task<AdmissionDto> ChangeStatusAsync(long id, AdmissionStatus status);
}
