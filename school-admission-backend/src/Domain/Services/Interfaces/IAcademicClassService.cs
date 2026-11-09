using Domain.Dtos.AcademicClasses;
using Domain.Entities;
using Framework.Services;

namespace Domain.Services.Interfaces;

public interface IAcademicClassService : IBaseService<AcademicClass>
{
    Task<(int Count, IEnumerable<AcademicClassDto> Items)> LoadAsync(AcademicClassQueryParams queryParams);
    Task<AcademicClassDto> GetAsync(long id);
    Task<AcademicClassDto> SaveAsync(AcademicClassVm model);
    Task<AcademicClassDto> ToggleStatusAsync(long id);
}
