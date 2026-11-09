using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Framework.Extensions;

public static class AppServiceCollectionExtensions
{
    public static void AddServiceCollections(this IServiceCollection services, IConfiguration configuration,
        IHostEnvironment environment)
    {
        
    }
}