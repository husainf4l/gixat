using Gixat.Web.Modules.Appointments.Interfaces;
using Gixat.Web.Modules.Appointments.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Gixat.Web.Modules.Appointments;

public static class AppointmentsModule
{
    public static IServiceCollection AddAppointmentsModuleServices(this IServiceCollection services)
    {
        services.AddScoped<IAppointmentService, AppointmentService>();
        return services;
    }
}
