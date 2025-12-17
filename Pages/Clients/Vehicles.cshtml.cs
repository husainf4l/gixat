using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Clients.Entities;
using Gixat.Web.Modules.Clients.Interfaces;

namespace Gixat.Web.Pages.Clients;

[Authorize]
public class VehiclesModel : PageModel
{
    private readonly IClientService _clientService;
    private readonly IClientVehicleService _vehicleService;

    public VehiclesModel(
        IClientService clientService,
        IClientVehicleService vehicleService)
    {
        _clientService = clientService;
        _vehicleService = vehicleService;
    }

    public Client Client { get; set; } = default!;
    public IEnumerable<ClientVehicle> Vehicles { get; set; } = new List<ClientVehicle>();
    public Guid CompanyId { get; set; }

    [BindProperty]
    public VehicleInput NewVehicle { get; set; } = new();

    [BindProperty]
    public VehicleEditInput EditVehicle { get; set; } = new();

    public class VehicleInput
    {
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int? Year { get; set; }
        public string? LicensePlate { get; set; }
        public string? Vin { get; set; }
        public string? Color { get; set; }
        public int? Mileage { get; set; }
        public string? EngineType { get; set; }
        public string? Transmission { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class VehicleEditInput
    {
        public Guid Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int? Year { get; set; }
        public string? LicensePlate { get; set; }
        public string? Vin { get; set; }
        public string? Color { get; set; }
        public int? Mileage { get; set; }
        public string? EngineType { get; set; }
        public string? Transmission { get; set; }
        public bool IsPrimary { get; set; }
    }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        CompanyId = Guid.Parse(User.FindFirst("CompanyId")?.Value ?? Guid.Empty.ToString());

        Client = await _clientService.GetByIdAsync(id);
        if (Client == null)
        {
            return NotFound();
        }

        Vehicles = await _vehicleService.GetByClientIdAsync(id);
        return Page();
    }

    public async Task<IActionResult> OnPostAddVehicleAsync(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        CompanyId = Guid.Parse(User.FindFirst("CompanyId")?.Value ?? Guid.Empty.ToString());

        if (!ModelState.IsValid)
        {
            Client = await _clientService.GetByIdAsync(id);
            Vehicles = await _vehicleService.GetByClientIdAsync(id);
            return Page();
        }

        var vehicle = new ClientVehicle
        {
            ClientId = id,
            Make = NewVehicle.Make,
            Model = NewVehicle.Model,
            Year = NewVehicle.Year,
            LicensePlate = NewVehicle.LicensePlate,
            Vin = NewVehicle.Vin,
            Color = NewVehicle.Color,
            Mileage = NewVehicle.Mileage,
            EngineType = NewVehicle.EngineType,
            Transmission = NewVehicle.Transmission,
            IsPrimary = NewVehicle.IsPrimary,
            IsActive = true
        };

        await _vehicleService.CreateAsync(vehicle);
        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostEditVehicleAsync(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        CompanyId = Guid.Parse(User.FindFirst("CompanyId")?.Value ?? Guid.Empty.ToString());

        if (!ModelState.IsValid)
        {
            Client = await _clientService.GetByIdAsync(id);
            Vehicles = await _vehicleService.GetByClientIdAsync(id);
            return Page();
        }

        var vehicle = await _vehicleService.GetByIdAsync(EditVehicle.Id);
        if (vehicle == null)
        {
            return NotFound();
        }

        vehicle.Make = EditVehicle.Make;
        vehicle.Model = EditVehicle.Model;
        vehicle.Year = EditVehicle.Year;
        vehicle.LicensePlate = EditVehicle.LicensePlate;
        vehicle.Vin = EditVehicle.Vin;
        vehicle.Color = EditVehicle.Color;
        vehicle.Mileage = EditVehicle.Mileage;
        vehicle.EngineType = EditVehicle.EngineType;
        vehicle.Transmission = EditVehicle.Transmission;
        vehicle.IsPrimary = EditVehicle.IsPrimary;

        await _vehicleService.UpdateAsync(vehicle);
        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostDeleteVehicleAsync(Guid id, Guid vehicleId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        await _vehicleService.DeleteAsync(vehicleId);
        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostSetPrimaryAsync(Guid id, Guid vehicleId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var vehicles = await _vehicleService.GetByClientIdAsync(id);
        foreach (var vehicle in vehicles)
        {
            vehicle.IsPrimary = vehicle.Id == vehicleId;
            await _vehicleService.UpdateAsync(vehicle);
        }

        return RedirectToPage(new { id });
    }
}
