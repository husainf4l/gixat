using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Users.Interfaces;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;

namespace Gixat.Web.Pages.Sessions;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly ISessionService _sessionService;
    private readonly ICustomerRequestService _customerRequestService;
    private readonly IInspectionService _inspectionService;
    private readonly ITestDriveService _testDriveService;
    private readonly IJobCardService _jobCardService;

    public DetailsModel(
        ICompanyUserService companyUserService,
        ISessionService sessionService,
        ICustomerRequestService customerRequestService,
        IInspectionService inspectionService,
        ITestDriveService testDriveService,
        IJobCardService jobCardService)
    {
        _companyUserService = companyUserService;
        _sessionService = sessionService;
        _customerRequestService = customerRequestService;
        _inspectionService = inspectionService;
        _testDriveService = testDriveService;
        _jobCardService = jobCardService;
    }

    public Guid CompanyId { get; set; }
    public SessionDto? Session { get; set; }
    public CustomerRequestDto? CustomerRequest { get; set; }
    public InspectionDto? Inspection { get; set; }
    public TestDriveDto? TestDrive { get; set; }
    public JobCardDto? JobCard { get; set; }

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

        Session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (Session == null)
        {
            return NotFound();
        }

        // Load related data
        CustomerRequest = await _customerRequestService.GetBySessionIdAsync(id, CompanyId);
        Inspection = await _inspectionService.GetBySessionIdAsync(id, CompanyId);
        TestDrive = await _testDriveService.GetBySessionIdAsync(id, CompanyId);
        JobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);

        return Page();
    }

    public async Task<IActionResult> OnPostCancelAsync(Guid id)
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

        await _sessionService.CancelSessionAsync(id, CompanyId);

        return RedirectToPage("/Sessions/Index");
    }
}
