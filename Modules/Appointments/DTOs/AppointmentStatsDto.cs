namespace Gixat.Web.Modules.Appointments.DTOs;

public class AppointmentStatsDto
{
    public int TodayAppointments { get; set; }
    public int UpcomingAppointments { get; set; }
    public int PendingConfirmations { get; set; }
    public int NoShowCount { get; set; }
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
}
