using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Users.Interfaces;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;

namespace Gixat.Web.Pages.Sessions;

[Authorize]
public class CheckoutModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly ISessionService _sessionService;
    private readonly IJobCardService _jobCardService;

    public CheckoutModel(
        ICompanyUserService companyUserService,
        ISessionService sessionService,
        IJobCardService jobCardService)
    {
        _companyUserService = companyUserService;
        _sessionService = sessionService;
        _jobCardService = jobCardService;
    }

    public Guid CompanyId { get; set; }
    public SessionDto? Session { get; set; }
    public JobCardDto? JobCard { get; set; }

    [BindProperty]
    public int? MileageOut { get; set; }

    public async Task<IActionResult> OnGetAsync(Guid id)
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

        Session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (Session == null)
        {
            return NotFound();
        }

        // Load job card
        JobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);

        // Pre-fill mileage out with mileage in if available
        MileageOut = Session.MileageIn;

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

        // Check out the session
        var success = await _sessionService.CheckOutAsync(id, MileageOut, CompanyId);

        if (!success)
        {
            TempData["ErrorMessage"] = "Failed to check out session.";
            return RedirectToPage(new { id });
        }

        TempData["SuccessMessage"] = "Vehicle checked out successfully!";
        return RedirectToPage("/Sessions/Index");
    }
}
