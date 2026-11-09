using System.Reflection;

namespace Framework.Data;

public class EntityAssemblyOptions
{
    public IReadOnlyList<Assembly> Assemblies { get; }

    public EntityAssemblyOptions(params Assembly[] assemblies)
    {
        Assemblies = assemblies;
    }
}
