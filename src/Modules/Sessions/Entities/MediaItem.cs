using Gixat.Shared.Entities;
using Gixat.Modules.Sessions.Enums;

namespace Gixat.Modules.Sessions.Entities;

/// <summary>
/// Stores media files (images/videos) in AWS S3
/// </summary>
public class MediaItem : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid CompanyId { get; set; }
    
    // File Info
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    
    // AWS S3 Info
    public string S3Key { get; set; } = string.Empty;
    public string S3Bucket { get; set; } = string.Empty;
    public string? S3Url { get; set; }
    
    // Categorization
    public MediaType MediaType { get; set; }
    public MediaCategory Category { get; set; }
    
    // Optional link to specific entity
    public Guid? CustomerRequestId { get; set; }
    public Guid? InspectionId { get; set; }
    public Guid? TestDriveId { get; set; }
    public Guid? JobCardId { get; set; }
    public Guid? JobCardItemId { get; set; }
    
    // Metadata
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Tags { get; set; }
    public int SortOrder { get; set; } = 0;
    
    // Thumbnail for videos
    public string? ThumbnailS3Key { get; set; }
    
    // Navigation
    public virtual GarageSession Session { get; set; } = null!;
    public virtual CustomerRequest? CustomerRequest { get; set; }
    public virtual Inspection? Inspection { get; set; }
    public virtual TestDrive? TestDrive { get; set; }
    public virtual JobCard? JobCard { get; set; }
    public virtual JobCardItem? JobCardItem { get; set; }
}
