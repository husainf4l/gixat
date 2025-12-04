using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Companies.Entities;

/// <summary>
/// Represents a physical branch/location of a company
/// </summary>
public class Branch : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; } // Branch code for reference
    
    // Contact
    public string? Phone { get; set; }
    public string? Email { get; set; }
    
    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    
    // Operating Hours
    public string? OperatingHours { get; set; } // JSON or formatted string
    
    // Capacity
    public int? ServiceBays { get; set; } // Number of service bays
    
    public bool IsMainBranch { get; set; } = false;
    public bool IsActive { get; set; } = true;
}
