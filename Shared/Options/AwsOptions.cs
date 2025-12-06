using System.ComponentModel.DataAnnotations;

namespace Gixat.Web.Shared.Options;

public class AwsOptions
{
    public const string SectionName = "AWS";

    [Required]
    public string AccessKey { get; set; } = string.Empty;

    [Required]
    public string SecretKey { get; set; } = string.Empty;

    [Required]
    public string Region { get; set; } = string.Empty;

    [Required]
    public S3Options S3 { get; set; } = new();
}

public class S3Options
{
    [Required]
    public string BucketName { get; set; } = string.Empty;
}
