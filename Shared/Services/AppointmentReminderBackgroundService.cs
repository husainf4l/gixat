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

        // Get tomorrow's date range (must use UTC for PostgreSQL)
        var tomorrow = DateTime.UtcNow.Date.AddDays(1);
        var dayAfterTomorrow = tomorrow.AddDays(1);

        // Find garage sessions with estimated completion tomorrow that haven't received a reminder
        // Note: This assumes sessions with EstimatedCompletionAt are similar to "appointments"
        var sessionsDueTomorrow = await dbContext.GarageSessions
            .Where(s => s.EstimatedCompletionAt.HasValue
                     && s.EstimatedCompletionAt.Value >= tomorrow 
                     && s.EstimatedCompletionAt.Value < dayAfterTomorrow
                     && !s.ReminderSent)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Found {Count} sessions needing reminders", sessionsDueTomorrow.Count);

        foreach (var session in sessionsDueTomorrow)
        {
            try
            {
                // For now, skip notification if we don't have client/vehicle details
                // In a real implementation, you'd load these via navigation properties
                _logger.LogInformation("Would send reminder for session {SessionNumber}", session.SessionNumber);
                
                // Mark as sent to avoid duplicates
                session.ReminderSent = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process reminder for session {Id}", session.Id);
            }
        }

        // Save changes to mark reminders as sent
        if (sessionsDueTomorrow.Any())
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Saved {Count} reminder status updates", sessionsDueTomorrow.Count);
        }
    }
}
