using Gixat.Shared.Entities;

namespace Gixat.Modules.Users.Entities;

/// <summary>
/// Represents a company user/employee in the garage management system
/// </summary>
public class CompanyUser : BaseEntity
{
    // Link to Identity User
    public Guid AuthUserId { get; set; }
    
    // Link to Company
    public Guid CompanyId { get; set; }
    
    // User Details
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    
    // Employment
    public string? EmployeeId { get; set; } // Internal employee ID
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public Guid? BranchId { get; set; } // Assigned branch
    
    // Role in Company
    public CompanyUserRole Role { get; set; } = CompanyUserRole.Employee;
    
    // Status
    public bool IsActive { get; set; } = true;
    public DateTime? JoinedAt { get; set; }
    public DateTime? LastActiveAt { get; set; }
    
    // Permissions (JSON or flags)
    public string? Permissions { get; set; }
    
    // Computed
    public string FullName => $"{FirstName} {LastName}".Trim();
}

public enum CompanyUserRole
{
    Owner = 0,      // Company owner - full access
    Admin = 1,      // Administrator - can manage users and settings
    Manager = 2,    // Manager - can manage operations
    Technician = 3, // Technician/Mechanic
    Receptionist = 4, // Front desk
    Employee = 5    // General employee
}
