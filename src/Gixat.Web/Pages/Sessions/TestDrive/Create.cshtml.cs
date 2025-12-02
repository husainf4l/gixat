using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.TestDrive;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly ITestDriveService _testDriveService;
    private readonly ICompanyUserService _companyUserService;

    public CreateModel(
        ISessionService sessionService,
        ITestDriveService testDriveService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _testDriveService = testDriveService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public Guid CompanyId { get; set; }

    [BindProperty]
    public TestDriveInput Input { get; set; } = new();

    public class TestDriveInput
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? MileageStart { get; set; }
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
        Input.Title = $"Test Drive - {session.VehicleDisplayName}";
        Input.MileageStart = session.MileageIn;
        
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

        var createDto = new CreateTestDriveDto(
            SessionId: id,
            Title: Input.Title,
            Description: Input.Description,
            MileageStart: Input.MileageStart,
            OverallPriority: Input.OverallPriority
        );

        await _testDriveService.CreateAsync(createDto, CompanyId);

        return RedirectToPage("/Sessions/Details", new { id });
    }
}
