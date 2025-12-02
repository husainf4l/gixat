using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Gixat.Modules.Clients.Data;
using Gixat.Modules.Clients.Interfaces;
using Gixat.Modules.Clients.Services;

namespace Gixat.Modules.Clients;

public static class ClientsModule
{
    public static IServiceCollection AddClientsModule(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<ClientDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("Gixat.Web")));

        // Add services
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IClientVehicleService, ClientVehicleService>();

        return services;
    }
}
