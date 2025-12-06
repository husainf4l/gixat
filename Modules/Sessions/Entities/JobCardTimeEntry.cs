using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Time tracking for job card items - clock in/out functionality
/// </summary>
public class JobCardTimeEntry : BaseEntity
{
    public Guid? JobCardItemId { get; set; }
    public Guid JobCardId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Technician
    public Guid TechnicianId { get; set; }
    public string TechnicianName { get; set; } = string.Empty;
    
    // Time tracking
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public decimal Hours { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    
    // Work description
    public string? Description { get; set; }
    public string? Notes { get; set; }
    
    // Billing
    public bool IsBillable { get; set; } = true;
    public decimal HourlyRate { get; set; } = 0;
    public decimal TotalCost { get; set; } = 0;
    
    // Break tracking
    public decimal BreakMinutes { get; set; } = 0;
    
    // Navigation
    public virtual JobCardItem JobCardItem { get; set; } = null!;
    public virtual JobCard JobCard { get; set; } = null!;
}
