using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Data;
using Gixat.Web.Modules.Sessions.Services;
using Gixat.Web.Modules.Sessions.Entities;

namespace Gixat.Web.Shared.Services;

/// <summary>
/// Background service that sends appointment reminders 24 hours before scheduled appointments
/// </summary>
public class AppointmentReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AppointmentReminderBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Check every hour

    public AppointmentReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<AppointmentReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Appointment Reminder Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessAppointmentRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing appointment reminders");
            }

            // Wait for next check interval
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Appointment Reminder Background Service stopped");
    }

    private async Task ProcessAppointmentRemindersAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<NotificationService>();

        // Get tomorrow's date range
        var tomorrow = DateTime.Today.AddDays(1);
        var dayAfterTomorrow = tomorrow.AddDays(1);

        // Find appointments scheduled for tomorrow that haven't received a reminder
        var appointmentsDueTomorrow = await dbContext.Sessions
            .Include(s => s.Client)
            .Include(s => s.Vehicle)
            .Include(s => s.Company)
            .Where(s => s.ScheduledStart >= tomorrow 
                     && s.ScheduledStart < dayAfterTomorrow
                     && !s.ReminderSent
                     && s.Client != null
                     && !string.IsNullOrEmpty(s.Client.Email))
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Found {Count} appointments needing reminders", appointmentsDueTomorrow.Count);

        foreach (var appointment in appointmentsDueTomorrow)
        {
            try
            {
                var vehicleInfo = appointment.Vehicle != null 
                    ? $"{appointment.Vehicle.Make} {appointment.Vehicle.Model} ({appointment.Vehicle.LicensePlate})"
                    : "Your vehicle";

                var success = await notificationService.SendAppointmentReminderAsync(
                    clientEmail: appointment.Client!.Email!,
                    clientName: appointment.Client.FullName ?? "Valued Customer",
                    appointmentDate: appointment.ScheduledStart,
                    vehicleInfo: vehicleInfo,
                    serviceType: appointment.ServiceType ?? "Vehicle Service",
                    garageName: appointment.Company.Name,
                    garageAddress: appointment.Company.Address ?? "Our Service Center",
                    garagePhone: appointment.Company.Phone ?? ""
                );

                if (success)
                {
                    appointment.ReminderSent = true;
                    _logger.LogInformation("Reminder sent for appointment {Id} to {Email}", 
                        appointment.Id, appointment.Client.Email);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send reminder for appointment {Id}", appointment.Id);
            }
        }

        // Save changes to mark reminders as sent
        if (appointmentsDueTomorrow.Any())
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Saved {Count} reminder status updates", appointmentsDueTomorrow.Count);
        }
    }
}
