using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Users.Interfaces;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Pages.Sessions;

[Authorize]
public class IndexModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly ISessionService _sessionService;

    public IndexModel(ICompanyUserService companyUserService, ISessionService sessionService)
    {
        _companyUserService = companyUserService;
        _sessionService = sessionService;
    }

    public Guid CompanyId { get; set; }
    public List<SessionDto> Sessions { get; set; } = new();
    
    [BindProperty(SupportsGet = true)]
    public string? StatusFilter { get; set; }
    
    [BindProperty(SupportsGet = true)]
    public string? SearchTerm { get; set; }

    public async Task<IActionResult> OnGetAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.OrderBy(x => x.CompanyId).FirstOrDefault();

        if (currentCompany == null)
        {
            return RedirectToPage("/Setup/Company");
        }

        CompanyId = currentCompany.CompanyId;

        // Get sessions based on filter
        if (!string.IsNullOrEmpty(SearchTerm))
        {
            Sessions = (await _sessionService.SearchAsync(CompanyId, SearchTerm)).ToList();
        }
        else if (!string.IsNullOrEmpty(StatusFilter) && Enum.TryParse<SessionStatus>(StatusFilter, out var status))
        {
            Sessions = (await _sessionService.GetAllAsync(CompanyId, status)).ToList();
        }
        else
        {
            Sessions = (await _sessionService.GetActiveSessionsAsync(CompanyId)).ToList();
        }

        return Page();
    }
}
