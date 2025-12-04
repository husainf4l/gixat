using System.ComponentModel.DataAnnotations;

namespace Gixat.Web.Modules.Auth.DTOs;

public record LoginDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; init; } = string.Empty;

    public bool RememberMe { get; init; } = false;
}
