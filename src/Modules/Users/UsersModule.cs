using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Gixat.Modules.Users.Data;
using Gixat.Modules.Users.Interfaces;
using Gixat.Modules.Users.Services;

namespace Gixat.Modules.Users;

public static class UsersModule
{
    public static IServiceCollection AddUsersModule(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<UserDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(UserDbContext).Assembly.FullName)));

        // Add services
        services.AddScoped<ICompanyUserService, CompanyUserService>();

        return services;
    }
}
