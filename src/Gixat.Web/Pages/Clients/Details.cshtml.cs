using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.Interfaces;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Users.Interfaces;
using Gixat.Modules.Companies.Interfaces;

namespace Gixat.Web.Pages.Clients;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly IClientService _clientService;
    private readonly IClientVehicleService _vehicleService;
    private readonly ISessionService _sessionService;
    private readonly ICompanyUserService _companyUserService;
    private readonly IBranchService _branchService;

    public DetailsModel(
        IClientService clientService, 
        IClientVehicleService vehicleService,
        ISessionService sessionService,
        ICompanyUserService companyUserService,
        IBranchService branchService)
    {
        _clientService = clientService;
        _vehicleService = vehicleService;
        _sessionService = sessionService;
        _companyUserService = companyUserService;
        _branchService = branchService;
    }

    public Client Client { get; set; } = default!;
    public IEnumerable<ClientVehicle> Vehicles { get; set; } = new List<ClientVehicle>();

    [BindProperty]
    public VehicleInput NewVehicle { get; set; } = new();

    public class VehicleInput
    {
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int? Year { get; set; }
        public string? Color { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string? Vin { get; set; }
        public string? EngineType { get; set; }
        public string? Transmission { get; set; }
        public int? Mileage { get; set; }
        public string? Notes { get; set; }
    }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var client = await _clientService.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        Client = client;
        Vehicles = await _vehicleService.GetByClientIdAsync(id);
        return Page();
    }

    public async Task<IActionResult> OnPostAddVehicleAsync(Guid id)
    {
        var client = await _clientService.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        var vehicle = new ClientVehicle
        {
            ClientId = id,
            Make = NewVehicle.Make,
            Model = NewVehicle.Model,
            Year = NewVehicle.Year,
            Color = NewVehicle.Color,
            LicensePlate = NewVehicle.LicensePlate,
            Vin = NewVehicle.Vin,
            EngineType = NewVehicle.EngineType,
            Transmission = NewVehicle.Transmission,
            Mileage = NewVehicle.Mileage,
            Notes = NewVehicle.Notes
        };

        await _vehicleService.CreateAsync(vehicle);
        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostDeleteVehicleAsync(Guid id, Guid vehicleId)
    {
        await _vehicleService.DeleteAsync(vehicleId);
        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostCreateSessionAsync(Guid id, Guid vehicleId)
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

        var companyId = currentCompany.CompanyId;
        
        // Get default branch
        var branches = await _branchService.GetByCompanyIdAsync(companyId);
        var branchId = branches.FirstOrDefault()?.Id ?? Guid.Empty;

        var createDto = new CreateSessionDto(
            CompanyId: companyId,
            BranchId: branchId,
            ClientId: id,
            ClientVehicleId: vehicleId,
            MileageIn: null,
            EstimatedCompletionAt: null,
            ServiceAdvisorId: Guid.Parse(userId),
            Notes: null
        );

        var session = await _sessionService.CreateAsync(createDto);

        return RedirectToPage("/Sessions/Details", new { id = session.Id });
    }
}
