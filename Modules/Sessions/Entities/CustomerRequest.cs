using Gixat.Web.Shared.Entities;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Customer's initial request/concerns when bringing the vehicle
/// </summary>
public class CustomerRequest : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Request Info
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    
    // Customer concerns
    public string? CustomerConcerns { get; set; }
    public string? RequestedServices { get; set; }
    public Priority Priority { get; set; } = Priority.Normal;
    
    // Additional info
    public string? Notes { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? CompletedById { get; set; }
    
    // Navigation
    public virtual GarageSession Session { get; set; } = null!;
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}
