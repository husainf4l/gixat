using Gixat.Web.Data;
using Gixat.Web.Modules.Appointments.Entities;
using Gixat.Web.Modules.Appointments.Interfaces;
using Gixat.Web.Modules.Appointments.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Gixat.Web.Modules.Appointments.Services;

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _context;
    private const int MaxConcurrentAppointments = 4; // Max appointments per time slot

    public AppointmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
    {
        // Generate appointment number
        var count = await _context.Appointments.CountAsync();
        appointment.AppointmentNumber = $"APT-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D4}";
        
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<Appointment?> GetAppointmentByIdAsync(Guid id)
    {
        return await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<List<Appointment>> GetAppointmentsByDateRangeAsync(DateTime startDate, DateTime endDate, Guid? companyId = null)
    {
        var query = _context.Appointments
            .Where(a => a.ScheduledDate >= startDate && a.ScheduledDate <= endDate);

        if (companyId.HasValue)
        {
            query = query.Where(a => a.CompanyId == companyId.Value);
        }

        return await query
            .OrderBy(a => a.ScheduledDate)
            .ThenBy(a => a.ScheduledTime)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetUpcomingAppointmentsAsync(Guid companyId, int days = 7)
    {
        var startDate = DateTime.UtcNow.Date;
        var endDate = startDate.AddDays(days);

        return await _context.Appointments
            .Where(a => a.CompanyId == companyId &&
                       a.ScheduledDate >= startDate &&
                       a.ScheduledDate <= endDate &&
                       a.Status != AppointmentStatus.Cancelled &&
                       a.Status != AppointmentStatus.Completed)
            .OrderBy(a => a.ScheduledDate)
            .ThenBy(a => a.ScheduledTime)
            .ToListAsync();
    }

    public async Task<bool> UpdateAppointmentAsync(Appointment appointment)
    {
        _context.Appointments.Update(appointment);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> ConfirmAppointmentAsync(Guid id)
    {
        var appointment = await GetAppointmentByIdAsync(id);
        if (appointment == null) return false;

        appointment.Status = AppointmentStatus.Confirmed;
        appointment.IsConfirmed = true;
        appointment.ConfirmedAt = DateTime.UtcNow;

        return await UpdateAppointmentAsync(appointment);
    }

    public async Task<bool> CancelAppointmentAsync(Guid id, string reason)
    {
        var appointment = await GetAppointmentByIdAsync(id);
        if (appointment == null) return false;

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.CancelledAt = DateTime.UtcNow;
        appointment.CancellationReason = reason;

        return await UpdateAppointmentAsync(appointment);
    }

    public async Task<bool> RescheduleAppointmentAsync(Guid id, DateTime newDate, TimeSpan newTime)
    {
        var appointment = await GetAppointmentByIdAsync(id);
        if (appointment == null) return false;

        appointment.ScheduledDate = newDate;
        appointment.ScheduledTime = newTime;
        appointment.Status = AppointmentStatus.Rescheduled;

        return await UpdateAppointmentAsync(appointment);
    }

    public async Task<bool> MarkAsNoShowAsync(Guid id)
    {
        var appointment = await GetAppointmentByIdAsync(id);
        if (appointment == null) return false;

        appointment.Status = AppointmentStatus.NoShow;
        return await UpdateAppointmentAsync(appointment);
    }

    public async Task<bool> ConvertToSessionAsync(Guid appointmentId, Guid sessionId)
    {
        var appointment = await GetAppointmentByIdAsync(appointmentId);
        if (appointment == null) return false;

        appointment.SessionId = sessionId;
        appointment.Status = AppointmentStatus.InProgress;

        return await UpdateAppointmentAsync(appointment);
    }

    public async Task<bool> IsTimeSlotAvailableAsync(DateTime date, TimeSpan time, int durationMinutes, Guid? excludeAppointmentId = null)
    {
        var appointmentStart = date.Date.Add(time);
        var appointmentEnd = appointmentStart.AddMinutes(durationMinutes);

        var conflictingCount = await _context.Appointments
            .Where(a => a.ScheduledDate == date.Date &&
                       a.Status != AppointmentStatus.Cancelled &&
                       a.Status != AppointmentStatus.Completed &&
                       (!excludeAppointmentId.HasValue || a.Id != excludeAppointmentId.Value))
            .CountAsync(a =>
                (a.ScheduledTime < time.Add(TimeSpan.FromMinutes(durationMinutes)) &&
                 a.ScheduledTime.Add(TimeSpan.FromMinutes(a.DurationMinutes)) > time));

        return conflictingCount < MaxConcurrentAppointments;
    }

    public async Task<List<TimeSlot>> GetAvailableTimeSlotsAsync(DateTime date, int durationMinutes)
    {
        var slots = new List<TimeSlot>();
        var startHour = 8; // 8 AM
        var endHour = 18; // 6 PM

        for (int hour = startHour; hour < endHour; hour++)
        {
            for (int minute = 0; minute < 60; minute += 30) // 30-minute intervals
            {
                var time = new TimeSpan(hour, minute, 0);
                var isAvailable = await IsTimeSlotAvailableAsync(date, time, durationMinutes);

                var booked = await _context.Appointments
                    .CountAsync(a => a.ScheduledDate == date.Date &&
                                   a.ScheduledTime == time &&
                                   a.Status != AppointmentStatus.Cancelled);

                slots.Add(new TimeSlot
                {
                    Time = time,
                    IsAvailable = isAvailable,
                    BookedCount = booked
                });
            }
        }

        return slots;
    }

    public async Task<AppointmentStatsDto> GetAppointmentStatsAsync(Guid companyId)
    {
        var today = DateTime.UtcNow.Date;
        var sevenDaysFromNow = today.AddDays(7);

        var appointments = await _context.Appointments
            .Where(a => a.CompanyId == companyId)
            .ToListAsync();

        var stats = new AppointmentStatsDto
        {
            TodayAppointments = appointments.Count(a => a.ScheduledDate.Date == today && 
                                                       a.Status != AppointmentStatus.Cancelled),
            
            UpcomingAppointments = appointments.Count(a => a.ScheduledDate > today && 
                                                          a.ScheduledDate <= sevenDaysFromNow &&
                                                          a.Status != AppointmentStatus.Cancelled),
            
            PendingConfirmations = appointments.Count(a => a.Status == AppointmentStatus.Scheduled && 
                                                          !a.IsConfirmed &&
                                                          a.ScheduledDate >= today),
            
            NoShowCount = appointments.Count(a => a.Status == AppointmentStatus.NoShow),
            
            TotalAppointments = appointments.Count,
            
            CompletedAppointments = appointments.Count(a => a.Status == AppointmentStatus.Completed)
        };

        return stats;
    }
}
