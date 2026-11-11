using Domain.Dtos;
using Domain.Entities;
using Domain.Services.Interfaces;
using Framework.Repositories;
using Framework.Services;

namespace Domain.Services;

public class AcademicClassService : BaseService<AcademicClass>, IAcademicClassService
{
    private readonly IAdmissionHoldService _holdService;

    public AcademicClassService(IBaseRepository<AcademicClass> baseRepository, IAdmissionHoldService holdService) : base(baseRepository)
    {
        _holdService = holdService;
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

        query = query.OrderBy(x => x.Order).ThenBy(x => x.Shift).ThenBy(x => x.TotalSeats);

        var (count, items) = await LoadAsync(query, queryParams.PageNumber, queryParams.PageSize);

        var dtos = new List<AcademicClassDto>();
        foreach (var item in items)
        {
            var (availableSeats, confirmedSeats) = await _holdService.GetSeatSummaryAsync(item.Id);
            dtos.Add(ToDto(item, availableSeats, confirmedSeats));
        }

        return (count, dtos);
    }

    public async Task<AcademicClassDto> GetAsync(long id)
    {
        var entity = await GetByIdAsync(id);
        var (availableSeats, confirmedSeats) = await _holdService.GetSeatSummaryAsync(id);
        return ToDto(entity, availableSeats, confirmedSeats);
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
        var (availableSeats, confirmedSeats) = await _holdService.GetSeatSummaryAsync(entity.Id);
        return ToDto(entity, availableSeats, confirmedSeats);
    }

    public async Task<AcademicClassDto> ToggleStatusAsync(long id)
    {
        var entity = await GetByIdAsync(id);
        entity.IsActive = !entity.IsActive;
        entity = await UpdateAsync(entity);
        var (availableSeats, confirmedSeats) = await _holdService.GetSeatSummaryAsync(entity.Id);
        return ToDto(entity, availableSeats, confirmedSeats);
    }

    private static AcademicClassDto ToDto(AcademicClass entity, int availableSeats, int confirmedSeats) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Order = entity.Order,
        TotalSeats = entity.TotalSeats,
        AvailableSeats = availableSeats,
        ConfirmedSeats = confirmedSeats,
        IsActive = entity.IsActive,
        Shift = entity.Shift,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };
}