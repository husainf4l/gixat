using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Companies.Entities;

/// <summary>
/// Represents a garage/auto service company in the system
/// </summary>
public class Company : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? TradeName { get; set; }
    public string? TaxId { get; set; } // VAT/Tax number
    public string? RegistrationNumber { get; set; } // Commercial registration
    
    // Contact Information
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Website { get; set; }
    
    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    
    // Branding
    public string? LogoUrl { get; set; }
    
    // Subscription/Plan
    public CompanyPlan Plan { get; set; } = CompanyPlan.Free;
    public DateTime? PlanExpiresAt { get; set; }
    
    // Settings
    public string? TimeZone { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Locale { get; set; }
    
    // Status
    public bool IsActive { get; set; } = true;
    public bool IsVerified { get; set; } = false;
    
    // Owner - the primary account holder
    public Guid OwnerId { get; set; }
}

public enum CompanyPlan
{
    Free = 0,
    Starter = 1,
    Professional = 2,
    Enterprise = 3
}
