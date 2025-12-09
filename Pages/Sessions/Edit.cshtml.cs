using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions;

[Authorize]
public class EditModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly ICompanyUserService _companyUserService;

    public EditModel(
        ISessionService sessionService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _companyUserService = companyUserService;
    }

    public Guid CompanyId { get; set; }
    public string SessionNumber { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string VehicleDisplayName { get; set; } = string.Empty;

    [BindProperty]
    public SessionEditInput Input { get; set; } = new();

    public class SessionEditInput
    {
        public Guid Id { get; set; }
        public int? MileageIn { get; set; }
        public string? Notes { get; set; }
    }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
        {
            return RedirectToPage("/Setup/Company");
        }
        CompanyId = currentCompany.CompanyId;

        var session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (session == null)
        {
            return NotFound();
        }

        SessionNumber = session.SessionNumber;
        ClientName = session.ClientName;
        VehicleDisplayName = session.VehicleDisplayName;

        Input = new SessionEditInput
        {
            Id = session.Id,
            MileageIn = session.MileageIn,
            Notes = session.Notes
        };

        return Page();
    }

    public async Task<IActionResult> OnPostAsync(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
        {
            return RedirectToPage("/Setup/Company");
        }
        CompanyId = currentCompany.CompanyId;

        if (!ModelState.IsValid)
        {
            var session = await _sessionService.GetByIdAsync(id, CompanyId);
            if (session == null)
            {
                return NotFound();
            }
            SessionNumber = session.SessionNumber;
            ClientName = session.ClientName;
            VehicleDisplayName = session.VehicleDisplayName;
            return Page();
        }

        var updateDto = new UpdateSessionDto(
            Status: null,
            MileageIn: Input.MileageIn,
            MileageOut: null,
            EstimatedCompletionAt: null,
            ServiceAdvisorId: null,
            TechnicianId: null,
            Notes: Input.Notes,
            InternalNotes: null
        );

        var result = await _sessionService.UpdateAsync(Input.Id, updateDto, CompanyId);
        if (result == null)
        {
            ModelState.AddModelError(string.Empty, "Failed to update session");
            return Page();
        }

        TempData["SuccessMessage"] = "Session updated successfully";
        return RedirectToPage("/Sessions/Details", new { id = Input.Id });
    }
}
