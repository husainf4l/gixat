using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.JobCard;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly IJobCardService _jobCardService;
    private readonly ICompanyUserService _companyUserService;

    public CreateModel(
        ISessionService sessionService,
        IJobCardService jobCardService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _jobCardService = jobCardService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public Guid CompanyId { get; set; }

    [BindProperty]
    public JobCardInput Input { get; set; } = new();

    public class JobCardInput
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Priority Priority { get; set; } = Priority.Normal;
        public decimal EstimatedHours { get; set; }
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

        // Check if a JobCard already exists for this session
        var existingJobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (existingJobCard != null)
        {
            // Redirect to the existing JobCard details
            return RedirectToPage("/Sessions/JobCard/Details", new { id = existingJobCard.Id });
        }

        Session = session;
        Input.Title = $"Service Work - {session.VehicleDisplayName}";
        
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

        // Check if a JobCard already exists for this session
        var existingJobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (existingJobCard != null)
        {
            // Redirect to the existing JobCard details (route uses session id)
            return RedirectToPage("/Sessions/JobCard/Details", new { id });
        }

        if (!ModelState.IsValid)
        {
            Session = session;
            return Page();
        }

        var createDto = new CreateJobCardDto(
            SessionId: id,
            Title: Input.Title,
            Description: Input.Description,
            Priority: Input.Priority,
            EstimatedHours: Input.EstimatedHours
        );

        await _jobCardService.CreateAsync(createDto, CompanyId);

        return RedirectToPage("/Sessions/Details", new { id });
    }
}
