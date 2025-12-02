using System.ComponentModel.DataAnnotations;

namespace Gixat.Modules.Companies.DTOs;

public record CreateCompanyDto
{
    [Required(ErrorMessage = "Company name is required")]
    [StringLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
    public string Name { get; init; } = string.Empty;
    
    public string? TradeName { get; init; }
    
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; init; } = string.Empty;
    
    [Phone(ErrorMessage = "Invalid phone number")]
    public string? Phone { get; init; }
    
    public string? TaxId { get; init; }
    public string? RegistrationNumber { get; init; }
    
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }
    
    public string? TimeZone { get; init; }
    public string Currency { get; init; } = "USD";
}
