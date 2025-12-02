using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.Interfaces;

namespace Gixat.Web.Pages.Clients;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly IClientService _clientService;
    private readonly IClientVehicleService _vehicleService;

    public DetailsModel(IClientService clientService, IClientVehicleService vehicleService)
    {
        _clientService = clientService;
        _vehicleService = vehicleService;
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
}
