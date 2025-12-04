using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Clients.Entities;

public class ClientVehicle : BaseEntity
{
    public Guid ClientId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Vehicle Info
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int? Year { get; set; }
    public string? Color { get; set; }
    public string? LicensePlate { get; set; }
    public string? Vin { get; set; }
    
    // Additional Details
    public string? EngineType { get; set; }
    public string? Transmission { get; set; }
    public int? Mileage { get; set; }
    public string? Notes { get; set; }
    
    public bool IsActive { get; set; } = true;
    public bool IsPrimary { get; set; } = false;
    
    public string DisplayName => $"{Year} {Make} {Model}".Trim();
    
    // Navigation
    public virtual Client Client { get; set; } = null!;
}
