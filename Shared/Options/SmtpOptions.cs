using System.ComponentModel.DataAnnotations;

namespace Gixat.Web.Shared.Options;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    [Required]
    public string Host { get; set; } = string.Empty;

    [Required]
    [Range(1, 65535)]
    public int Port { get; set; }

    public bool Secure { get; set; }

    [Required]
    public string User { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FromName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string FromEmail { get; set; } = string.Empty;
}
