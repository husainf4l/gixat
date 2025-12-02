using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Gixat.Modules.Users.Interfaces;
using Gixat.Modules.Clients.Interfaces;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Companies.Interfaces;

namespace Gixat.Web.Pages.Sessions;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly IClientService _clientService;
    private readonly IClientVehicleService _vehicleService;
    private readonly ISessionService _sessionService;
    private readonly IBranchService _branchService;

    public CreateModel(
        ICompanyUserService companyUserService,
        IClientService clientService,
        IClientVehicleService vehicleService,
        ISessionService sessionService,
        IBranchService branchService)
    {
        _companyUserService = companyUserService;
        _clientService = clientService;
        _vehicleService = vehicleService;
        _sessionService = sessionService;
        _branchService = branchService;
    }

    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    public List<Client> Clients { get; set; } = new();
    
    [BindProperty]
    public Guid SelectedClientId { get; set; }
    
    [BindProperty]
    public Guid SelectedVehicleId { get; set; }
    
    [BindProperty]
    public int? MileageIn { get; set; }
    
    [BindProperty]
    public string? Notes { get; set; }

    public async Task<IActionResult> OnGetAsync()
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
        
        // Get default branch
        var branches = await _branchService.GetByCompanyIdAsync(CompanyId);
        BranchId = branches.FirstOrDefault()?.Id ?? Guid.Empty;

        // Load clients for dropdown
        Clients = (await _clientService.GetByCompanyIdAsync(CompanyId)).ToList();

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
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
        
        // Get default branch
        var branches = await _branchService.GetByCompanyIdAsync(CompanyId);
        BranchId = branches.FirstOrDefault()?.Id ?? Guid.Empty;

        if (SelectedClientId == Guid.Empty || SelectedVehicleId == Guid.Empty)
        {
            ModelState.AddModelError("", "Please select a client and vehicle");
            Clients = (await _clientService.GetByCompanyIdAsync(CompanyId)).ToList();
            return Page();
        }

        var createDto = new CreateSessionDto(
            CompanyId: CompanyId,
            BranchId: BranchId,
            ClientId: SelectedClientId,
            ClientVehicleId: SelectedVehicleId,
            MileageIn: MileageIn,
            EstimatedCompletionAt: null,
            ServiceAdvisorId: Guid.Parse(userId),
            Notes: Notes
        );

        var session = await _sessionService.CreateAsync(createDto);

        return RedirectToPage("/Sessions/Details", new { id = session.Id });
    }

    public async Task<IActionResult> OnGetVehiclesAsync(Guid clientId)
    {
        var vehicles = await _vehicleService.GetByClientIdAsync(clientId);
        return new JsonResult(vehicles.Select(v => new { v.Id, DisplayName = v.DisplayName }));
    }
}
