using Gixat.Web.Shared.Entities;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Represents a garage session - when a vehicle enters the garage for service
/// </summary>
public class GarageSession : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    
    // Client & Vehicle
    public Guid ClientId { get; set; }
    public Guid ClientVehicleId { get; set; }
    
    // Session Info
    public string SessionNumber { get; set; } = string.Empty;
    public SessionStatus Status { get; set; } = SessionStatus.CheckedIn;
    
    // Mileage at check-in
    public int? MileageIn { get; set; }
    public int? MileageOut { get; set; }
    
    // Timestamps
    public DateTime CheckInAt { get; set; } = DateTime.UtcNow;
    public DateTime? CheckOutAt { get; set; }
    public DateTime? EstimatedCompletionAt { get; set; }
    
    // Assigned staff
    public Guid? ServiceAdvisorId { get; set; }
    public Guid? TechnicianId { get; set; }
    
    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }
    
    // Notifications
    public bool ReminderSent { get; set; }
    public bool ReadyNotificationSent { get; set; }
    
    // Navigation properties
    public virtual CustomerRequest? CustomerRequest { get; set; }
    public virtual Inspection? Inspection { get; set; }
    public virtual TestDrive? TestDrive { get; set; }
    public virtual JobCard? JobCard { get; set; }
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}
