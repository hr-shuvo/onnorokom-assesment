using Framework.Data;
using Framework.Repositories;
using Framework.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Framework.Extensions;

public static class FrameworkServiceCollectionExtensions
{
    public static IServiceCollection AddFrameworkServices(this IServiceCollection services, IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default")));

        services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
        services.AddScoped(typeof(IBaseService<>), typeof(BaseService<>));

        services.AddCors(options => options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

        return services;
    }
}
