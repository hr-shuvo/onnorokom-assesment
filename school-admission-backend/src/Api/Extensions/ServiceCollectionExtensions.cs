using Domain.Entities;
using Domain.Services;
using Domain.Services.Interfaces;
using Framework.Persistence;
using Framework.Repositories;
using Framework.Services;
using Microsoft.EntityFrameworkCore;

namespace Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static void AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(new EntityAssemblyOptions(typeof(AcademicClass).Assembly));

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default")));

        services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
        services.AddScoped(typeof(IBaseService<>), typeof(BaseService<>));

        services.AddScoped<IAcademicClassService, AcademicClassService>();
    }
}
