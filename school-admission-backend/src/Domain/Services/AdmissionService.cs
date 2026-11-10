using Domain.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Services.Interfaces;
using Framework.Exceptions;
using Framework.Repositories;
using Framework.Services;
using Microsoft.EntityFrameworkCore;

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
        if (model.Status == AdmissionStatus.Archived)
        {
            throw new BadRequestException("Admission cannot be set to Archived directly; use the status-change action instead.");
        }

        if (model.Id.HasValue)
        {
            var existing = await GetByIdAsync(model.Id.Value);

            if (model.Status == AdmissionStatus.Published)
            {
                await EnsureNoOtherPublishedAsync(model.Id.Value);
            }

            existing.Title = model.Title;
            existing.Description = model.Description;
            existing.OpensAt = model.OpensAt;
            existing.ClosesAt = model.ClosesAt;
            existing.HoldMinutes = model.HoldMinutes;
            existing.Status = model.Status;

            existing = await UpdateAsync(existing);
            return ToDto(existing);
        }

        if (model.Status == AdmissionStatus.Published)
        {
            await EnsureNoOtherPublishedAsync(excludingId: null);
        }

        var entity = new Admission
        {
            Title = model.Title,
            Description = model.Description,
            OpensAt = model.OpensAt,
            ClosesAt = model.ClosesAt,
            HoldMinutes = model.HoldMinutes,
            Status = model.Status
        };

        entity = await CreateAsync(entity);
        return ToDto(entity);
    }

    public async Task<AdmissionDto> ChangeStatusAsync(long id, AdmissionStatus status)
    {
        var entity = await GetByIdAsync(id);

        if (status == AdmissionStatus.Published)
        {
            await EnsureNoOtherPublishedAsync(id);
        }

        entity.Status = status;
        entity = await UpdateAsync(entity);
        return ToDto(entity);
    }

    private async Task EnsureNoOtherPublishedAsync(long? excludingId)
    {
        var query = Query().Where(x => x.Status == AdmissionStatus.Published);

        if (excludingId.HasValue)
        {
            query = query.Where(x => x.Id != excludingId.Value);
        }

        if (await query.AnyAsync())
        {
            throw new ConflictException("Another admission is already Published. Archive it before publishing a new one.");
        }
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
