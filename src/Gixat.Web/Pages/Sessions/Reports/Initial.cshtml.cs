using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Users.Interfaces;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Clients.Interfaces;
using Gixat.Modules.Clients.Entities;

namespace Gixat.Web.Pages.Sessions.Reports;

[Authorize]
public class InitialModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly ISessionService _sessionService;
    private readonly ICustomerRequestService _customerRequestService;
    private readonly IInspectionService _inspectionService;
    private readonly ITestDriveService _testDriveService;
    private readonly IClientService _clientService;
    private readonly IClientVehicleService _clientVehicleService;

    public InitialModel(
        ICompanyUserService companyUserService,
        ISessionService sessionService,
        ICustomerRequestService customerRequestService,
        IInspectionService inspectionService,
        ITestDriveService testDriveService,
        IClientService clientService,
        IClientVehicleService clientVehicleService)
    {
        _companyUserService = companyUserService;
        _sessionService = sessionService;
        _customerRequestService = customerRequestService;
        _inspectionService = inspectionService;
        _testDriveService = testDriveService;
        _clientService = clientService;
        _clientVehicleService = clientVehicleService;
    }

    public Guid CompanyId { get; set; }
    public SessionDto Session { get; set; } = default!;
    public CustomerRequestDto? CustomerRequest { get; set; }
    public InspectionDto? Inspection { get; set; }
    public TestDriveDto? TestDrive { get; set; }
    public Client? Client { get; set; }
    public ClientVehicle? Vehicle { get; set; }

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

        // Load related data
        CustomerRequest = await _customerRequestService.GetBySessionIdAsync(id, CompanyId);
        Inspection = await _inspectionService.GetBySessionIdAsync(id, CompanyId);
        TestDrive = await _testDriveService.GetBySessionIdAsync(id, CompanyId);
        
        // Load client and vehicle details
        Client = await _clientService.GetByIdAsync(session.ClientId);
        Vehicle = await _clientVehicleService.GetByIdAsync(session.ClientVehicleId);

        return Page();
    }
}
