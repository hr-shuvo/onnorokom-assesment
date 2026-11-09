using Framework.Entities;
using Framework.Exceptions;
using Framework.Repositories;

namespace Framework.Services;

public class BaseService<TEntity> : IBaseService<TEntity>
    where TEntity : BaseEntity
{
    private readonly IBaseRepository<TEntity> _repository;

    public BaseService(IBaseRepository<TEntity> repository)
    {
        _repository = repository;
    }

    public Task<(int Count, IEnumerable<TEntity> Items)> LoadAsync(IQueryable<TEntity> query, int pageNumber,
        int pageSize)
    {
        return _repository.ToPagedListAsync(query, pageNumber, pageSize);
    }

    protected IQueryable<TEntity> Query(bool withTracking = false)
    {
        return _repository.Query(withTracking);
    }

    public async Task<TEntity> GetByIdAsync(long id)
    {
        return await _repository.Get(id, withTracking: true)
               ?? throw new NotFoundException($"{typeof(TEntity).Name} with id {id} was not found.");
    }

    public async Task<TEntity> CreateAsync(TEntity entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        await _repository.AddAsync(entity);
        await _repository.SaveChangesAsync();
        return entity;
    }

    public async Task<TEntity> UpdateAsync(TEntity entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _repository.Update(entity);
        await _repository.SaveChangesAsync();
        return entity;
    }

    public async Task DeleteAsync(long id)
    {
        var entity = await GetByIdAsync(id);
        _repository.Remove(entity);
        await _repository.SaveChangesAsync();
    }
}