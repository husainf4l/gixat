using Microsoft.Extensions.DependencyInjection;
using Gixat.Web.Modules.Companies.Interfaces;
using Gixat.Web.Modules.Companies.Services;

namespace Gixat.Web.Modules.Companies;

public static class CompaniesModule
{
    /// <summary>
    /// Register only services (no DbContext). Use when AppDbContext is registered centrally.
    /// </summary>
    public static IServiceCollection AddCompaniesModuleServices(this IServiceCollection services)
    {
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IBranchService, BranchService>();
        return services;
    }
}
