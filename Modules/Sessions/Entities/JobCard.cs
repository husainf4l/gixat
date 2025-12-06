using Gixat.Web.Shared.Entities;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Job card - main work order containing all tasks to be performed
/// </summary>
public class JobCard : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Job Card Info
    public string JobCardNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public JobCardStatus Status { get; set; } = JobCardStatus.Draft;
    
    // Priority & Timeline
    public Priority Priority { get; set; } = Priority.Normal;
    public DateTime? EstimatedStartAt { get; set; }
    public DateTime? EstimatedCompletionAt { get; set; }
    public DateTime? ActualStartAt { get; set; }
    public DateTime? ActualCompletionAt { get; set; }
    
    // Labor estimates
    public decimal EstimatedHours { get; set; }
    public decimal ActualHours { get; set; }
    
    // Assigned staff
    public Guid? SupervisorId { get; set; }
    public Guid? PrimaryTechnicianId { get; set; }
    
    // Approval
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedById { get; set; }
    public string? ApprovalNotes { get; set; }
    
    // Customer Authorization
    public bool CustomerAuthorized { get; set; } = false;
    public DateTime? CustomerAuthorizedAt { get; set; }
    public string? CustomerAuthorizationMethod { get; set; } // Signature, Verbal, Email, SMS
    public string? CustomerAuthorizationNotes { get; set; }
    
    // Summary
    public string? WorkSummary { get; set; }
    public string? TechnicianNotes { get; set; }
    public string? QualityNotes { get; set; }
    
    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }
    
    // Navigation
    public virtual GarageSession Session { get; set; } = null!;
    public virtual ICollection<JobCardItem> Items { get; set; } = new List<JobCardItem>();
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
    public virtual ICollection<JobCardComment> Comments { get; set; } = new List<JobCardComment>();
    public virtual ICollection<JobCardTimeEntry> TimeEntries { get; set; } = new List<JobCardTimeEntry>();
    public virtual ICollection<JobCardPart> Parts { get; set; } = new List<JobCardPart>();
}
