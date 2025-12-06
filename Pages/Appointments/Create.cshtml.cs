using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using Gixat.Web.Data;
using Gixat.Web.Modules.Appointments.Entities;

namespace Gixat.Web.Pages.Appointments;

public class CreateModel : PageModel
{
    private readonly AppDbContext _context;

    public CreateModel(AppDbContext context)
    {
        _context = context;
    }

    [BindProperty]
    public InputModel Input { get; set; } = new();

    public string? ErrorMessage { get; set; }
    public List<ClientItem> Clients { get; set; } = new();
    public List<VehicleItem> Vehicles { get; set; } = new();

    public async Task OnGetAsync()
    {
        await LoadDataAsync();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            await LoadDataAsync();
            return Page();
        }

        try
        {
            // Parse date and time
            if (!DateTime.TryParse(Input.ScheduledDate, out var scheduledDate))
            {
                ErrorMessage = "Invalid date format";
                await LoadDataAsync();
                return Page();
            }

            if (!TimeSpan.TryParse(Input.ScheduledTime, out var scheduledTime))
            {
                ErrorMessage = "Invalid time format";
                await LoadDataAsync();
                return Page();
            }

            // Get client
            var client = await _context.Clients
                .Where(c => c.Id == Input.ClientId)
                .FirstOrDefaultAsync();

            if (client == null)
            {
                ErrorMessage = "Client not found";
                await LoadDataAsync();
                return Page();
            }

            // Create appointment
            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                CompanyId = client.CompanyId,
                BranchId = Guid.Empty, // TODO: Get from context
                ClientId = Input.ClientId,
                ClientVehicleId = Input.ClientVehicleId,
                ScheduledDate = DateTime.SpecifyKind(scheduledDate, DateTimeKind.Utc),
                ScheduledTime = scheduledTime,
                DurationMinutes = Input.DurationMinutes,
                ServiceType = Input.ServiceType,
                ContactPhone = Input.ContactPhone,
                ContactEmail = Input.ContactEmail,
                CustomerNotes = Input.Notes,
                Status = AppointmentStatus.Scheduled
            };

            // Generate appointment number
            var count = await _context.Appointments.CountAsync();
            appointment.AppointmentNumber = $"APT-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D4}";

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Details", new { id = appointment.Id });
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred while creating the appointment: {ex.Message}";
            await LoadDataAsync();
            return Page();
        }
    }

    private async Task LoadDataAsync()
    {
        Clients = await _context.Clients
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .Select(c => new ClientItem
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName
            })
            .AsNoTracking()
            .ToListAsync();

        Vehicles = await _context.ClientVehicles
            .OrderBy(v => v.Make)
            .ThenBy(v => v.Model)
            .Select(v => new VehicleItem
            {
                Id = v.Id,
                ClientId = v.ClientId,
                Make = v.Make ?? string.Empty,
                Model = v.Model ?? string.Empty,
                LicensePlate = v.LicensePlate ?? string.Empty
            })
            .AsNoTracking()
            .ToListAsync();
    }

    public class InputModel
    {
        [Required]
        public Guid ClientId { get; set; }

        public Guid? ClientVehicleId { get; set; }

        [Required]
        [Phone]
        public string ContactPhone { get; set; } = string.Empty;

        [EmailAddress]
        public string? ContactEmail { get; set; }

        [Required]
        public string ScheduledDate { get; set; } = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");

        [Required]
        public string ScheduledTime { get; set; } = "09:00";

        [Required]
        [Range(30, 480)]
        public int DurationMinutes { get; set; } = 60;

        [Required]
        public string ServiceType { get; set; } = string.Empty;

        public string? Notes { get; set; }
    }

    public class ClientItem
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class VehicleItem
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
    }
}
