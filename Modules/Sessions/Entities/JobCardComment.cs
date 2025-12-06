using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Comments/notes on job cards for team collaboration
/// </summary>
public class JobCardComment : BaseEntity
{
    public Guid JobCardId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Author
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    
    // Comment content
    public string Content { get; set; } = string.Empty;
    public CommentType Type { get; set; } = CommentType.General;
    
    // Mentions
    public string? MentionedUserIds { get; set; } // JSON array of user IDs
    
    // Attachments
    public bool HasAttachment { get; set; } = false;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    
    // Status tracking
    public bool IsResolved { get; set; } = false;
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedById { get; set; }
    
    // Parent comment for threading
    public Guid? ParentCommentId { get; set; }
    
    // Navigation
    public virtual JobCard JobCard { get; set; } = null!;
    public virtual JobCardComment? ParentComment { get; set; }
    public virtual ICollection<JobCardComment> Replies { get; set; } = new List<JobCardComment>();
}

public enum CommentType
{
    General = 0,
    Question = 1,
    Issue = 2,
    Suggestion = 3,
    Update = 4,
    Approval = 5
}
