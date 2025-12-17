using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.JobCard;

[Authorize]
public class AddItemModel : PageModel
{
    private readonly IJobCardService _jobCardService;
    private readonly ICompanyUserService _companyUserService;

    public AddItemModel(
        IJobCardService jobCardService,
        ICompanyUserService companyUserService)
    {
        _jobCardService = jobCardService;
        _companyUserService = companyUserService;
    }

    [BindProperty]
    public string Title { get; set; } = string.Empty;

    [BindProperty]
    public string? Description { get; set; }

    [BindProperty]
    public string? Category { get; set; }

    [BindProperty]
    public Priority Priority { get; set; } = Priority.Normal;

    [BindProperty]
    public decimal EstimatedHours { get; set; }

    public Guid JobCardId { get; set; }
    public Guid SessionId { get; set; }
    public JobCardDto JobCard { get; set; } = default!;

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

        // id is the Session ID
        var jobCard = await _jobCardService.GetBySessionIdAsync(id, currentCompany.CompanyId);
        if (jobCard == null)
        {
            return NotFound();
        }

        SessionId = id;
        JobCardId = jobCard.Id;
        JobCard = jobCard;

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

        if (!ModelState.IsValid)
        {
            SessionId = id;
            var jobCard = await _jobCardService.GetBySessionIdAsync(id, currentCompany.CompanyId);
            if (jobCard == null)
            {
                return NotFound();
            }
            JobCardId = jobCard.Id;
            JobCard = jobCard;
            return Page();
        }

        var jobCardForSession = await _jobCardService.GetBySessionIdAsync(id, currentCompany.CompanyId);
        if (jobCardForSession == null)
        {
            return NotFound();
        }

        var dto = new CreateJobCardItemDto(
            JobCardId: jobCardForSession.Id,
            Title: Title,
            Description: Description,
            Category: Category,
            Priority: Priority,
            EstimatedHours: EstimatedHours
        );

        await _jobCardService.AddItemAsync(dto, currentCompany.CompanyId);

        return RedirectToPage("/Sessions/Details", new { id });
    }
}
