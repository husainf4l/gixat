using Gixat.Web.Modules.Appointments.Entities;
using Gixat.Web.Modules.Appointments.DTOs;

namespace Gixat.Web.Modules.Appointments.Interfaces;

public interface IAppointmentService
{
    Task<Appointment> CreateAppointmentAsync(Appointment appointment);
    Task<Appointment?> GetAppointmentByIdAsync(Guid id);
    Task<List<Appointment>> GetAppointmentsByDateRangeAsync(DateTime startDate, DateTime endDate, Guid? companyId = null);
    Task<List<Appointment>> GetUpcomingAppointmentsAsync(Guid companyId, int days = 7);
    Task<bool> UpdateAppointmentAsync(Appointment appointment);
    Task<bool> ConfirmAppointmentAsync(Guid id);
    Task<bool> CancelAppointmentAsync(Guid id, string reason);
    Task<bool> RescheduleAppointmentAsync(Guid id, DateTime newDate, TimeSpan newTime);
    Task<bool> MarkAsNoShowAsync(Guid id);
    Task<bool> ConvertToSessionAsync(Guid appointmentId, Guid sessionId);
    Task<bool> IsTimeSlotAvailableAsync(DateTime date, TimeSpan time, int durationMinutes, Guid? excludeAppointmentId = null);
    Task<List<TimeSlot>> GetAvailableTimeSlotsAsync(DateTime date, int durationMinutes);
    Task<AppointmentStatsDto> GetAppointmentStatsAsync(Guid companyId);
}

public class TimeSlot
{
    public TimeSpan Time { get; set; }
    public bool IsAvailable { get; set; }
    public int BookedCount { get; set; }
}
