using Domain.Services;
using Domain.Services.Interfaces;
using Framework.Data;
using Microsoft.Extensions.DependencyInjection;

namespace Domain.Extensions;

public static class DomainServiceCollectionExtensions
{
    public static IServiceCollection AddDomainServices(this IServiceCollection services)
    {
        services.AddScoped<IAcademicClassService, AcademicClassService>();
        services.AddScoped<IAdmissionService, AdmissionService>();
        services.AddScoped<IAdmissionHoldService, AdmissionHoldService>();

        services.AddSingleton(new EntityAssemblyOptions(typeof(DomainServiceCollectionExtensions).Assembly));

        return services;
    }
}
