using Domain.BackgroundServices;
using Domain.Services;
using Domain.Services.Interfaces;
using Framework.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Domain.Extensions;

public static class DomainServiceCollectionExtensions
{
    public static IServiceCollection AddDomainServices(this IServiceCollection services)
    {
        services.AddScoped<IAcademicClassService, AcademicClassService>();
        services.AddScoped<IAdmissionHoldService, AdmissionHoldService>();
        services.AddSingleton(typeof(ISettingsService<>), typeof(JsonFileSettingsService<>));
        services.AddHostedService<HoldExpiryService>();

        services.AddSingleton(new EntityAssemblyOptions(typeof(DomainServiceCollectionExtensions).Assembly));

        return services;
    }
}
