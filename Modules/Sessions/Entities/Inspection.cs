using Gixat.Web.Shared.Entities;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Vehicle inspection record with findings
/// </summary>
public class Inspection : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Inspection Info
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    
    // Inspector
    public Guid? InspectorId { get; set; }
    public DateTime? InspectionStartedAt { get; set; }
    public DateTime? InspectionCompletedAt { get; set; }
    
    // Findings
    public string? ExteriorCondition { get; set; }
    public string? InteriorCondition { get; set; }
    public string? EngineCondition { get; set; }
    public string? TransmissionCondition { get; set; }
    public string? BrakeCondition { get; set; }
    public string? TireCondition { get; set; }
    public string? SuspensionCondition { get; set; }
    public string? ElectricalCondition { get; set; }
    public string? FluidLevels { get; set; }
    
    // Overall findings
    public string? Findings { get; set; }
    public string? Recommendations { get; set; }
    public Priority OverallPriority { get; set; } = Priority.Normal;
    
    // Notes
    public string? Notes { get; set; }
    
    // Navigation
    public virtual GarageSession Session { get; set; } = null!;
    public virtual ICollection<InspectionItem> Items { get; set; } = new List<InspectionItem>();
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}

/// <summary>
/// Individual inspection checklist item
/// </summary>
public class InspectionItem : BaseEntity
{
    public Guid InspectionId { get; set; }
    
    // Item Info
    public string Category { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Result
    public string? Condition { get; set; } // Good, Fair, Poor, Critical
    public string? Notes { get; set; }
    public Priority Priority { get; set; } = Priority.Normal;
    public bool RequiresAttention { get; set; } = false;
    
    // Sort
    public int SortOrder { get; set; } = 0;
    
    // Navigation
    public virtual Inspection Inspection { get; set; } = null!;
}
