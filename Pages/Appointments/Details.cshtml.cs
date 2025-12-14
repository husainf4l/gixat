using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Data;
using Gixat.Web.Modules.Appointments.Entities;

namespace Gixat.Web.Pages.Appointments;

public class DetailsModel : PageModel
{
    private readonly AppDbContext _context;

    public DetailsModel(AppDbContext context)
    {
        _context = context;
    }

    public Appointment? Appointment { get; set; }
    public string? SuccessMessage { get; set; }
    public string? ErrorMessage { get; set; }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var companyIdClaim = User.FindFirst("CompanyId")?.Value;
        if (string.IsNullOrEmpty(companyIdClaim) || !Guid.TryParse(companyIdClaim, out var companyId))
        {
            return BadRequest("Company information not found");
        }

        Appointment = await _context.Appointments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);

        if (Appointment == null)
        {
            return NotFound();
        }

        return Page();
    }

    public async Task<IActionResult> OnPostConfirmAsync(Guid id)
    {
        try
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !Guid.TryParse(companyIdClaim, out var companyId))
            {
                ErrorMessage = "Company information not found";
                return await OnGetAsync(id);
            }

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);
            
            if (appointment != null)
            {
                appointment.Status = AppointmentStatus.Confirmed;
                appointment.IsConfirmed = true;
                appointment.ConfirmedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                SuccessMessage = "Appointment confirmed successfully";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to confirm appointment: {ex.Message}";
        }

        return await OnGetAsync(id);
    }

    public async Task<IActionResult> OnPostCancelAsync(Guid id)
    {
        try
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !Guid.TryParse(companyIdClaim, out var companyId))
            {
                ErrorMessage = "Company information not found";
                return await OnGetAsync(id);
            }

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);
            
            if (appointment != null)
            {
                appointment.Status = AppointmentStatus.Cancelled;
                appointment.CancelledAt = DateTime.UtcNow;
                appointment.CancellationReason = "Cancelled by staff";
                await _context.SaveChangesAsync();
                SuccessMessage = "Appointment cancelled successfully";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to cancel appointment: {ex.Message}";
        }

        return await OnGetAsync(id);
    }

    public async Task<IActionResult> OnPostNoShowAsync(Guid id)
    {
        try
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !Guid.TryParse(companyIdClaim, out var companyId))
            {
                ErrorMessage = "Company information not found";
                return await OnGetAsync(id);
            }

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);
            
            if (appointment != null)
            {
                appointment.Status = AppointmentStatus.NoShow;
                await _context.SaveChangesAsync();
                SuccessMessage = "Appointment marked as no-show";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to mark as no-show: {ex.Message}";
        }

        return await OnGetAsync(id);
    }

    public async Task<IActionResult> OnPostStartSessionAsync(Guid id)
    {
        try
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !Guid.TryParse(companyIdClaim, out var companyId))
            {
                ErrorMessage = "Company information not found";
                return await OnGetAsync(id);
            }

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CompanyId == companyId);

            if (appointment == null)
            {
                ErrorMessage = "Appointment not found";
                return await OnGetAsync(id);
            }

            if (appointment.ClientVehicleId == null)
            {
                ErrorMessage = "Cannot start session: No vehicle associated with this appointment";
                return await OnGetAsync(id);
            }

            // TODO: Implement session creation logic
            ErrorMessage = "Session creation not yet implemented";
            return await OnGetAsync(id);
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to start session: {ex.Message}";
            return await OnGetAsync(id);
        }
    }
}
