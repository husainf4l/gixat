namespace Gixat.Modules.Companies.DTOs;

public record BranchDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Code { get; init; }
    
    public string? Phone { get; init; }
    public string? Email { get; init; }
    
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    
    public string? OperatingHours { get; init; }
    public int? ServiceBays { get; init; }
    
    public bool IsMainBranch { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}
