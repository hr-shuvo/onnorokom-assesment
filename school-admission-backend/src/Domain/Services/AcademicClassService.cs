using Domain.Dtos.AcademicClasses;
using Domain.Entities;
using Domain.Services.Interfaces;
using Framework.Repositories;
using Framework.Services;

namespace Domain.Services;

public class AcademicClassService : BaseService<AcademicClass>, IAcademicClassService
{
    public AcademicClassService(IBaseRepository<AcademicClass> baseRepository) : base(baseRepository)
    {
    }

    public async Task<(int Count, IEnumerable<AcademicClassDto> Items)> LoadAsync(AcademicClassQueryParams queryParams)
    {
        var query = Query();

        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            query = query.Where(x => x.Name.Contains(queryParams.Search));
        }

        if (queryParams.IsActive.HasValue)
        {
            query = query.Where(x => x.IsActive == queryParams.IsActive.Value);
        }

        if (queryParams.Shift.HasValue)
        {
            query = query.Where(x => x.Shift == queryParams.Shift.Value);
        }

        var (count, items) = await LoadAsync(query, queryParams.PageNumber, queryParams.PageSize);

        return (count, items.Select(ToDto));
    }

    public async Task<AcademicClassDto> GetAsync(long id)
    {
        var entity = await GetByIdAsync(id);
        return ToDto(entity);
    }

    public async Task<AcademicClassDto> SaveAsync(AcademicClassVm model)
    {
        var entity = model.Id.HasValue ? await GetByIdAsync(model.Id.Value) : new AcademicClass();

        entity.Name = model.Name;
        entity.Order = model.Order;
        entity.TotalSeats = model.TotalSeats;
        entity.IsActive = model.IsActive;
        entity.Shift = model.Shift;

        entity = model.Id.HasValue ? await UpdateAsync(entity) : await CreateAsync(entity);
        return ToDto(entity);
    }

    public async Task<AcademicClassDto> ToggleStatusAsync(long id)
    {
        var entity = await GetByIdAsync(id);
        entity.IsActive = !entity.IsActive;
        entity = await UpdateAsync(entity);
        return ToDto(entity);
    }

    private static AcademicClassDto ToDto(AcademicClass entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Order = entity.Order,
        TotalSeats = entity.TotalSeats,
        IsActive = entity.IsActive,
        Shift = entity.Shift,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };
}