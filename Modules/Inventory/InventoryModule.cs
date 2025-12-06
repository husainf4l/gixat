using Microsoft.Extensions.DependencyInjection;
using Gixat.Web.Modules.Inventory.Services;
using Gixat.Web.Modules.Inventory.Interfaces;

namespace Gixat.Web.Modules.Inventory;

public static class InventoryModule
{
    public static IServiceCollection AddInventoryModuleServices(this IServiceCollection services)
    {
        services.AddScoped<IInventoryService, InventoryService>();
        
        return services;
    }
}
