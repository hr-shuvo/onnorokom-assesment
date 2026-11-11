namespace Domain.Services.Interfaces;

public interface ISettingsService<T> where T : class, new()
{
    Task<T> GetAsync();
    Task<T> SaveAsync(T value);
}
