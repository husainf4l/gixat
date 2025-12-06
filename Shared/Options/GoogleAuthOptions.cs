using System.ComponentModel.DataAnnotations;

namespace Gixat.Web.Shared.Options;

public class GoogleAuthOptions
{
    public const string SectionName = "Authentication:Google";

    [Required]
    public string ClientId { get; set; } = string.Empty;

    [Required]
    public string ClientSecret { get; set; } = string.Empty;
}
