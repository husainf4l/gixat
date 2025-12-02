using Gixat.Shared.Entities;
using Gixat.Modules.Sessions.Enums;

namespace Gixat.Modules.Sessions.Entities;

/// <summary>
/// Test drive record with observations
/// </summary>
public class TestDrive : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Test Drive Info
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    
    // Driver
    public Guid? DriverId { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Mileage
    public int? MileageStart { get; set; }
    public int? MileageEnd { get; set; }
    public string? RouteDescription { get; set; }
    
    // Observations
    public string? EnginePerformance { get; set; }
    public string? TransmissionPerformance { get; set; }
    public string? BrakePerformance { get; set; }
    public string? SteeringPerformance { get; set; }
    public string? SuspensionPerformance { get; set; }
    public string? NoiseObservations { get; set; }
    public string? VibrationObservations { get; set; }
    public string? ElectricalObservations { get; set; }
    public string? AcPerformance { get; set; }
    
    // Overall
    public string? Findings { get; set; }
    public string? Recommendations { get; set; }
    public Priority OverallPriority { get; set; } = Priority.Normal;
    
    // Notes
    public string? Notes { get; set; }
    
    // Navigation
    public virtual GarageSession Session { get; set; } = null!;
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}
