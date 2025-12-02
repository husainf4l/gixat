using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.Inspection;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly IInspectionService _inspectionService;
    private readonly ICompanyUserService _companyUserService;

    public CreateModel(
        ISessionService sessionService,
        IInspectionService inspectionService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _inspectionService = inspectionService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public Guid CompanyId { get; set; }

    [BindProperty]
    public InspectionInput Input { get; set; } = new();

    public class InspectionInput
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Priority OverallPriority { get; set; } = Priority.Normal;
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

        Session = session;
        Input.Title = $"Vehicle Inspection - {session.VehicleDisplayName}";
        
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

        var session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (session == null)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            Session = session;
            return Page();
        }

        var createDto = new CreateInspectionDto(
            SessionId: id,
            Title: Input.Title,
            Description: Input.Description,
            OverallPriority: Input.OverallPriority
        );

        await _inspectionService.CreateAsync(createDto, CompanyId);

        return RedirectToPage("/Sessions/Details", new { id });
    }
}
