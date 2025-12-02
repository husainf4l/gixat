using System.ComponentModel.DataAnnotations;

namespace Gixat.Modules.Companies.DTOs;

#region Branch DTOs

public record BranchDto(
    Guid Id,
    Guid CompanyId,
    string Name,
    string? Code,
    string? Phone,
    string? Email,
    string? Address,
    string? City,
    string? State,
    string? PostalCode,
    string? OperatingHours,
    int? ServiceBays,
    bool IsMainBranch,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateBranchDto
{
    [Required(ErrorMessage = "Branch name is required")]
    [StringLength(100, ErrorMessage = "Branch name cannot exceed 100 characters")]
    public string Name { get; init; } = string.Empty;

    public string? Code { get; init; }

    [Phone(ErrorMessage = "Invalid phone number")]
    public string? Phone { get; init; }

    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string? Email { get; init; }

    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? OperatingHours { get; init; }
    public int? ServiceBays { get; init; }
    public bool IsMainBranch { get; init; } = false;
}

public record UpdateBranchDto
{
    [Required(ErrorMessage = "Branch name is required")]
    [StringLength(100, ErrorMessage = "Branch name cannot exceed 100 characters")]
    public string Name { get; init; } = string.Empty;

    public string? Code { get; init; }

    [Phone(ErrorMessage = "Invalid phone number")]
    public string? Phone { get; init; }

    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string? Email { get; init; }

    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? OperatingHours { get; init; }
    public int? ServiceBays { get; init; }
    public bool IsActive { get; init; } = true;
}

#endregion
