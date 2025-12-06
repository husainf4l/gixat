using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Data;
using Gixat.Web.Modules.Appointments.Entities;

namespace Gixat.Web.Pages.Appointments;

public class IndexModel : PageModel
{
    private readonly AppDbContext _context;

    public IndexModel(AppDbContext context)
    {
        _context = context;
    }

    public string ViewMode { get; set; } = "calendar";
    public DateTime SelectedDate { get; set; } = DateTime.UtcNow.Date;
    public List<AppointmentListItem> Appointments { get; set; } = new();
    public List<AppointmentListItem> AllAppointments { get; set; } = new();

    public async Task OnGetAsync(string? view, string? date)
    {
        ViewMode = view ?? "calendar";
        
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var parsedDate))
        {
            SelectedDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
        }

        if (ViewMode == "calendar")
        {
            // Load all appointments for the month
            var firstDayOfMonth = new DateTime(SelectedDate.Year, SelectedDate.Month, 1);
            var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);
            var firstDayUtc = DateTime.SpecifyKind(firstDayOfMonth, DateTimeKind.Utc);
            var lastDayUtc = DateTime.SpecifyKind(lastDayOfMonth, DateTimeKind.Utc);
            
            AllAppointments = await _context.Appointments
                .Where(a => a.ScheduledDate.Date >= firstDayUtc.Date && a.ScheduledDate.Date <= lastDayUtc.Date)
                .OrderBy(a => a.ScheduledDate)
                .ThenBy(a => a.ScheduledTime)
                .Select(a => new AppointmentListItem
                {
                    Id = a.Id,
                    ClientName = "",
                    ContactPhone = a.ContactPhone,
                    ServiceType = a.ServiceType,
                    ScheduledDate = a.ScheduledDate,
                    ScheduledTime = a.ScheduledTime,
                    DurationMinutes = a.DurationMinutes,
                    VehicleInfo = null,
                    Status = a.Status
                })
                .AsNoTracking()
                .ToListAsync();
            
            // Load appointments for selected date
            var selectedDateUtc = DateTime.SpecifyKind(SelectedDate.Date, DateTimeKind.Utc);
            Appointments = AllAppointments
                .Where(a => a.ScheduledDate.Date == selectedDateUtc.Date)
                .ToList();
        }
        else
        {
            // List view - show upcoming appointments
            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
            Appointments = await _context.Appointments
                .Where(a => a.ScheduledDate.Date >= today)
                .OrderBy(a => a.ScheduledDate)
                .ThenBy(a => a.ScheduledTime)
                .Take(50)
                .Select(a => new AppointmentListItem
                {
                    Id = a.Id,
                    ClientName = "", // We'll populate from client lookup
                    ContactPhone = a.ContactPhone,
                    ServiceType = a.ServiceType,
                    ScheduledDate = a.ScheduledDate,
                    ScheduledTime = a.ScheduledTime,
                    DurationMinutes = a.DurationMinutes,
                    VehicleInfo = null,
                    Status = a.Status
                })
                .AsNoTracking()
                .ToListAsync();
        }
    }

    public class AppointmentListItem
    {
        public Guid Id { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public TimeSpan ScheduledTime { get; set; }
        public int DurationMinutes { get; set; }
        public string? VehicleInfo { get; set; }
        public AppointmentStatus Status { get; set; }
    }
}
