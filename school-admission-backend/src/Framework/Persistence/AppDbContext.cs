using Microsoft.EntityFrameworkCore;

namespace Framework.Persistence;

public class AppDbContext : DbContext
{
    private readonly EntityAssemblyOptions _assemblyOptions;

    public AppDbContext(DbContextOptions<AppDbContext> options, EntityAssemblyOptions assemblyOptions)
        : base(options)
    {
        _assemblyOptions = assemblyOptions;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        foreach (var assembly in _assemblyOptions.Assemblies)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(assembly);
        }
    }
}
