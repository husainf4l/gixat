using System.ComponentModel.DataAnnotations;

namespace Gixat.Web.Shared.Options;

public class AdminUserOptions
{
    public const string SectionName = "AdminUser";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}
