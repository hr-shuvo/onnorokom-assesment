using Framework.Entities;

namespace Framework.Services;

public interface IBaseService<TEntity> where TEntity : BaseEntity
{
    Task<(int Count, IEnumerable<TEntity> Items)> LoadAsync(IQueryable<TEntity> query, int pageNumber, int pageSize);

    Task<TEntity> GetByIdAsync(long id);
    Task<TEntity> CreateAsync(TEntity entity);
    Task<TEntity> UpdateAsync(TEntity entity);
    Task DeleteAsync(long id);
}