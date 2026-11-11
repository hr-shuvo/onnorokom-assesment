using System.Data;
using System.Linq.Expressions;
using Framework.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace Framework.Repositories;

public interface IBaseRepository<TEntity> where TEntity : BaseEntity
{
    IQueryable<TEntity> Query(bool withTracking = false);

    Task<TEntity> Get(long id,  bool withTracking = false);
    Task<TEntity> Get(Expression<Func<TEntity, bool>> predicate, bool withTracking = false);

    Task<(int Count, IEnumerable<TEntity> Items)> ToPagedListAsync(IQueryable<TEntity> query, int page, int size);

    Task AddAsync(TEntity entity);
    void Update(TEntity entity);
    void Remove(TEntity entity);

    Task SaveChangesAsync();

    Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.Unspecified);
}