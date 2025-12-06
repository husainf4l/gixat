using Microsoft.Extensions.DependencyInjection;
using Gixat.Web.Modules.Invoices.Services;
using Gixat.Web.Modules.Invoices.Interfaces;

namespace Gixat.Web.Modules.Invoices;

public static class InvoicesModule
{
    public static IServiceCollection AddInvoicesModuleServices(this IServiceCollection services)
    {
        services.AddScoped<IInvoiceService, InvoiceService>();
        
        return services;
    }
}
