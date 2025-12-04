using Microsoft.Extensions.DependencyInjection;
using Gixat.Web.Modules.Clients.Interfaces;
using Gixat.Web.Modules.Clients.Services;

namespace Gixat.Web.Modules.Clients;

public static class ClientsModule
{
    /// <summary>
    /// Register only services (no DbContext). Use when AppDbContext is registered centrally.
    /// </summary>
    public static IServiceCollection AddClientsModuleServices(this IServiceCollection services)
    {
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IClientVehicleService, ClientVehicleService>();
        return services;
    }
}
