using Gixat.Web.Shared.Entities;
using Gixat.Web.Modules.Sessions.Enums;
using TaskStatus = Gixat.Web.Modules.Sessions.Enums.TaskStatus;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Individual task/work item within a job card
/// </summary>
public class JobCardItem : BaseEntity
{
    public Guid JobCardId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Task Info
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; } // Repair, Maintenance, Diagnosis, etc.
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public Priority Priority { get; set; } = Priority.Normal;
    
    // Source of this task
    public string? Source { get; set; } // CustomerRequest, Inspection, TestDrive
    public Guid? SourceId { get; set; } // Reference to the source entity
    
    // Assigned technician
    public Guid? TechnicianId { get; set; }
    
    // Time tracking
    public decimal EstimatedHours { get; set; }
    public decimal ActualHours { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Work details
    public string? WorkPerformed { get; set; }
    public string? TechnicianNotes { get; set; }
    public string? QualityCheckNotes { get; set; }
    public bool QualityChecked { get; set; } = false;
    public DateTime? QualityCheckedAt { get; set; }
    public Guid? QualityCheckedById { get; set; }
    
    // Sort order
    public int SortOrder { get; set; } = 0;
    
    // Notes
    public string? Notes { get; set; }
    
    // Navigation
    public virtual JobCard JobCard { get; set; } = null!;
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
    public virtual ICollection<JobCardTimeEntry> TimeEntries { get; set; } = new List<JobCardTimeEntry>();
    public virtual ICollection<JobCardPart> Parts { get; set; } = new List<JobCardPart>();
}
