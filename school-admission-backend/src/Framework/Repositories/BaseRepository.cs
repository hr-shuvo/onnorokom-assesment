using System.Linq.Expressions;
using Framework.Entities;
using Microsoft.EntityFrameworkCore;

namespace Framework.Repositories;

public class BaseRepository<TEntity>(DbContext context) : IBaseRepository<TEntity>
    where TEntity : BaseEntity
{
    private DbContext Context { get; } = context;
    protected DbSet<TEntity> DbSet => Context.Set<TEntity>();

    public IQueryable<TEntity> Query(bool withTracking = false)
    {
        return withTracking ? DbSet.AsNoTracking() : DbSet.AsQueryable();
    }

    public Task<TEntity> Get(long id, bool withTracking = false)
    {
        return withTracking
            ? DbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id)
            : DbSet.FirstOrDefaultAsync(e => e.Id == id);
    }

    public Task<TEntity> Get(Expression<Func<TEntity, bool>> predicate, bool withTracking = false)
    {
        return Query(withTracking).FirstOrDefaultAsync(predicate);
    }

    public Task<(int Count, IEnumerable<TEntity> Items)> ToPagedListAsync(IQueryable<TEntity> query, int page, int size)
    {
        throw new NotImplementedException();
    }

    public Task AddAsync(TEntity entity)
    {
        throw new NotImplementedException();
    }

    public void Update(TEntity entity)
    {
        throw new NotImplementedException();
    }

    public void Remove(TEntity entity)
    {
        throw new NotImplementedException();
    }
}