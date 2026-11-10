using Domain.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Services.Interfaces;
using Framework.Exceptions;
using Framework.Repositories;
using Framework.Services;

namespace Domain.Services;

public class AdmissionService : BaseService<Admission>, IAdmissionService
{
    public AdmissionService(IBaseRepository<Admission> repository) : base(repository)
    {
    }

    public async Task<(int Count, IEnumerable<AdmissionDto> Items)> LoadAsync(AdmissionQueryParams queryParams)
    {
        var query = Query();

        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            query = query.Where(x => x.Title.Contains(queryParams.Search));
        }

        if (queryParams.Status.HasValue)
        {
            query = query.Where(x => x.Status == queryParams.Status.Value);
        }

        var (count, items) = await LoadAsync(query, queryParams.PageNumber, queryParams.PageSize);

        return (count, items.Select(ToDto));
    }

    public async Task<AdmissionDto> GetAsync(long id)
    {
        var entity = await GetByIdAsync(id);
        return ToDto(entity);
    }

    public async Task<AdmissionDto> SaveAsync(AdmissionVm model)
    {
        if (model.Id.HasValue)
        {
            var existing = await GetByIdAsync(model.Id.Value);

            if (existing.Status != AdmissionStatus.Draft)
            {
                throw new ConflictException($"Admission with id {model.Id.Value} is {existing.Status} and can no longer be edited.");
            }

            existing.Title = model.Title;
            existing.Description = model.Description;
            existing.OpensAt = model.OpensAt;
            existing.ClosesAt = model.ClosesAt;
            existing.HoldMinutes = model.HoldMinutes;

            existing = await UpdateAsync(existing);
            return ToDto(existing);
        }

        var entity = new Admission
        {
            Title = model.Title,
            Description = model.Description,
            OpensAt = model.OpensAt,
            ClosesAt = model.ClosesAt,
            HoldMinutes = model.HoldMinutes,
            Status = AdmissionStatus.Draft
        };

        entity = await CreateAsync(entity);
        return ToDto(entity);
    }

    public async Task<AdmissionDto> ChangeStatusAsync(long id)
    {
        var entity = await GetByIdAsync(id);

        entity.Status = entity.Status switch
        {
            AdmissionStatus.Draft => AdmissionStatus.Published,
            AdmissionStatus.Published => AdmissionStatus.Archived,
            _ => throw new ConflictException($"Admission with id {id} is already Archived and cannot change status further.")
        };

        entity = await UpdateAsync(entity);
        return ToDto(entity);
    }

    private static AdmissionDto ToDto(Admission entity) => new()
    {
        Id = entity.Id,
        Title = entity.Title,
        Description = entity.Description,
        OpensAt = entity.OpensAt,
        ClosesAt = entity.ClosesAt,
        HoldMinutes = entity.HoldMinutes,
        Status = entity.Status,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };
}
