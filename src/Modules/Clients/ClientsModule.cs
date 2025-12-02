using Microsoft.Extensions.DependencyInjection;
using Gixat.Modules.Clients.Interfaces;
using Gixat.Modules.Clients.Services;

namespace Gixat.Modules.Clients;

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
