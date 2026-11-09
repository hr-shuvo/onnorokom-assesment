using Framework.Entities;

namespace Framework.Services;

public class BaseService<TEntity> : IBaseService<TEntity> where TEntity : BaseEntity
{
}