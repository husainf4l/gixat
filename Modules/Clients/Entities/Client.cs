using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Clients.Entities;

public class Client : BaseEntity
{
    public Guid CompanyId { get; set; }
    
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? AlternatePhone { get; set; }
    
    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    
    // Additional Info
    public string? Notes { get; set; }
    public string? PreferredContactMethod { get; set; } // Phone, Email, SMS
    public bool IsActive { get; set; } = true;
    public bool IsVip { get; set; } = false;
    
    // Stats
    public int TotalVisits { get; set; } = 0;
    public decimal TotalSpent { get; set; } = 0;
    public DateTime? LastVisitAt { get; set; }
    
    public string FullName => $"{FirstName} {LastName}".Trim();
    
    // Navigation
    public virtual ICollection<ClientVehicle> Vehicles { get; set; } = new List<ClientVehicle>();
}
