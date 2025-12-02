using Microsoft.Extensions.DependencyInjection;
using Gixat.Modules.Users.Interfaces;
using Gixat.Modules.Users.Services;

namespace Gixat.Modules.Users;

public static class UsersModule
{
    /// <summary>
    /// Register only services (no DbContext). Use when AppDbContext is registered centrally.
    /// </summary>
    public static IServiceCollection AddUsersModuleServices(this IServiceCollection services)
    {
        services.AddScoped<ICompanyUserService, CompanyUserService>();
        return services;
    }
}
