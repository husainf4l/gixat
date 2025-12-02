using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.JobCard;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly IJobCardService _jobCardService;
    private readonly ICompanyUserService _companyUserService;

    public DetailsModel(
        ISessionService sessionService,
        IJobCardService jobCardService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _jobCardService = jobCardService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public JobCardDto JobCard { get; set; } = default!;
    public Guid CompanyId { get; set; }

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

        // The id parameter is the SessionId (from route /Sessions/{id}/JobCard)
        var session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (session == null)
        {
            return NotFound();
        }
        Session = session;

        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            // No JobCard exists, redirect to create
            return RedirectToPage("/Sessions/JobCard/Create", new { id });
        }
        JobCard = jobCard;

        return Page();
    }

    public async Task<IActionResult> OnPostStartWorkAsync(Guid id)
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

        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            return NotFound();
        }

        await _jobCardService.StartWorkAsync(jobCard.Id, CompanyId);

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostCompleteWorkAsync(Guid id)
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

        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            return NotFound();
        }

        await _jobCardService.CompleteWorkAsync(jobCard.Id, CompanyId);

        return RedirectToPage("/Sessions/Details", new { id });
    }

    public async Task<IActionResult> OnPostApproveAsync(Guid id)
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

        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            return NotFound();
        }

        await _jobCardService.ApproveAsync(jobCard.Id, Guid.Parse(userId), null, CompanyId);

        return RedirectToPage(new { id });
    }
}
