namespace Gixat.Modules.Companies.DTOs;

public record CompanyDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? TradeName { get; init; }
    public string? TaxId { get; init; }
    public string? RegistrationNumber { get; init; }
    
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Website { get; init; }
    
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }
    
    public string? LogoUrl { get; init; }
    public string Plan { get; init; } = string.Empty;
    public DateTime? PlanExpiresAt { get; init; }
    
    public string? TimeZone { get; init; }
    public string Currency { get; init; } = string.Empty;
    
    public bool IsActive { get; init; }
    public bool IsVerified { get; init; }
    
    public Guid OwnerId { get; init; }
    public DateTime CreatedAt { get; init; }
    
    public int UserCount { get; init; }
    public int BranchCount { get; init; }
}
