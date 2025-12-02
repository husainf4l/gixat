using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Gixat.Modules.Companies.Data;
using Gixat.Modules.Companies.Interfaces;
using Gixat.Modules.Companies.Services;

namespace Gixat.Modules.Companies;

public static class CompaniesModule
{
    public static IServiceCollection AddCompaniesModule(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<CompanyDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("Gixat.Web")));

        // Register services
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IBranchService, BranchService>();

        return services;
    }
}
