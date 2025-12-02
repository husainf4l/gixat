using Microsoft.Extensions.DependencyInjection;

namespace Gixat.Shared.Interfaces;

public interface IModule
{
    void RegisterServices(IServiceCollection services);
}
