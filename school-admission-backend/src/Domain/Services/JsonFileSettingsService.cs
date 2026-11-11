using System.Text.Json;
using Domain.Services.Interfaces;
using Microsoft.Extensions.Hosting;

namespace Domain.Services;

public class JsonFileSettingsService<T> : ISettingsService<T> where T : class, new()
{
    private static readonly SemaphoreSlim FileLock = new(1, 1);

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private readonly string _filePath;

    public JsonFileSettingsService(IHostEnvironment environment)
    {
        var configDirectory = Path.Combine(environment.ContentRootPath, "config");
        Directory.CreateDirectory(configDirectory);

        _filePath = Path.Combine(configDirectory, $"{typeof(T).Name}.json");
    }

    public async Task<T> GetAsync()
    {
        await FileLock.WaitAsync();
        try
        {
            if (!File.Exists(_filePath))
            {
                var defaultValue = new T();
                await WriteFileAsync(defaultValue);
                return defaultValue;
            }

            var json = await File.ReadAllTextAsync(_filePath);
            return JsonSerializer.Deserialize<T>(json, JsonOptions) ?? new T();
        }
        finally
        {
            FileLock.Release();
        }
    }

    public async Task<T> SaveAsync(T value)
    {
        await FileLock.WaitAsync();
        try
        {
            await WriteFileAsync(value);
            return value;
        }
        finally
        {
            FileLock.Release();
        }
    }

    private Task WriteFileAsync(T value)
    {
        var json = JsonSerializer.Serialize(value, JsonOptions);
        return File.WriteAllTextAsync(_filePath, json);
    }
}
