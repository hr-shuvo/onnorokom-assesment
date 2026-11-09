using System.Reflection;

namespace Framework.Persistence;

public class EntityAssemblyOptions
{
    public IReadOnlyList<Assembly> Assemblies { get; }

    public EntityAssemblyOptions(params Assembly[] assemblies)
    {
        Assemblies = assemblies;
    }
}
