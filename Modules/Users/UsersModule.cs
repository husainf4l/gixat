using Microsoft.Extensions.DependencyInjection;
using Gixat.Web.Modules.Users.Interfaces;
using Gixat.Web.Modules.Users.Services;

namespace Gixat.Web.Modules.Users;

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
