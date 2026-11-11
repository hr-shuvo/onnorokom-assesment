using System.Data;
using System.Linq.Expressions;
using Framework.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Framework.Repositories;

public class BaseRepository<TEntity> : IBaseRepository<TEntity>
    where TEntity : BaseEntity
{
    private readonly DbContext _context;

    public BaseRepository(DbContext context)
    {
        _context = context;
    }

    protected DbSet<TEntity> DbSet => _context.Set<TEntity>();

    public IQueryable<TEntity> Query(bool withTracking = false)
    {
        return withTracking ? DbSet.AsNoTracking() : DbSet.AsQueryable();
    }

    public Task<TEntity> Get(long id, bool withTracking = false)
    {
        return withTracking
            ? DbSet.FirstOrDefaultAsync(e => e.Id == id)
            : DbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
    }

    public Task<TEntity> Get(Expression<Func<TEntity, bool>> predicate, bool withTracking = false)
    {
        return Query(withTracking).FirstOrDefaultAsync(predicate);
    }

    public async Task<(int Count, IEnumerable<TEntity> Items)> ToPagedListAsync(IQueryable<TEntity> query, int page, int size)
    {
        var count = await query.CountAsync();
        var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();
        return (count, items);
    }

    public async Task AddAsync(TEntity entity)
    {
        await DbSet.AddAsync(entity);
    }

    public void Update(TEntity entity)
    {
        DbSet.Update(entity);
    }

    public void Remove(TEntity entity)
    {
        DbSet.Remove(entity);
    }

    public Task SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }

    public Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.Unspecified)
    {
        return _context.Database.BeginTransactionAsync(isolationLevel);
    }
}