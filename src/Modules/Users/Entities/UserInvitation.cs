using Gixat.Shared.Entities;

namespace Gixat.Modules.Users.Entities;

/// <summary>
/// Represents an invitation to join a company
/// </summary>
public class UserInvitation : BaseEntity
{
    public Guid CompanyId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public CompanyUserRole Role { get; set; } = CompanyUserRole.Employee;
    public Guid? BranchId { get; set; }
    
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    
    public Guid InvitedByUserId { get; set; }
    
    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;
    public DateTime? AcceptedAt { get; set; }
}

public enum InvitationStatus
{
    Pending = 0,
    Accepted = 1,
    Expired = 2,
    Cancelled = 3
}
