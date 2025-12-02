using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.CustomerRequest;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly ICustomerRequestService _customerRequestService;
    private readonly ICompanyUserService _companyUserService;

    public CreateModel(
        ISessionService sessionService,
        ICustomerRequestService customerRequestService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _customerRequestService = customerRequestService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public Guid CompanyId { get; set; }

    [BindProperty]
    public CustomerRequestInput Input { get; set; } = new();

    public class CustomerRequestInput
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CustomerConcerns { get; set; }
        public string? RequestedServices { get; set; }
        public Priority Priority { get; set; } = Priority.Normal;
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

        Session = session;
        
        // Pre-fill title with vehicle info
        Input.Title = $"Service Request - {session.VehicleDisplayName}";
        
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

        var createDto = new CreateCustomerRequestDto(
            SessionId: id,
            Title: Input.Title,
            Description: Input.Description,
            CustomerConcerns: Input.CustomerConcerns,
            RequestedServices: Input.RequestedServices,
            Priority: Input.Priority,
            Notes: Input.Notes
        );

        await _customerRequestService.CreateAsync(createDto, CompanyId);

        return RedirectToPage("/Sessions/Details", new { id });
    }
}
