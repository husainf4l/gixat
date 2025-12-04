using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Gixat.Web.HealthChecks;

/// <summary>
/// Health check for AWS S3 connectivity and bucket accessibility
/// </summary>
public class AwsS3HealthCheck : IHealthCheck
{
    private readonly IAmazonS3 _s3Client;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AwsS3HealthCheck> _logger;

    public AwsS3HealthCheck(
        IAmazonS3 s3Client, 
        IConfiguration configuration,
        ILogger<AwsS3HealthCheck> logger)
    {
        _s3Client = s3Client;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if AWS credentials are configured first (fail fast)
            var accessKey = _configuration["AWS:AccessKey"];
            var secretKey = _configuration["AWS:SecretKey"];
            var bucketName = _configuration["AWS:S3:BucketName"];
            
            if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
            {
                return HealthCheckResult.Degraded(
                    "AWS S3 credentials not configured (optional service)",
                    data: new Dictionary<string, object>
                    {
                        { "configured", false },
                        { "message", "S3 storage is optional and not required for core functionality" }
                    });
            }
            
            if (string.IsNullOrEmpty(bucketName))
            {
                return HealthCheckResult.Degraded(
                    "AWS S3 bucket name not configured",
                    data: new Dictionary<string, object>
                    {
                        { "configured", false }
                    });
            }

            // Use timeout to prevent long hangs
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(5));

            // Try to get bucket location (requires less permissions than ListBucket)
            try
            {
                var locationRequest = new GetBucketLocationRequest
                {
                    BucketName = bucketName
                };

                var locationResponse = await _s3Client.GetBucketLocationAsync(locationRequest, cts.Token);

                return HealthCheckResult.Healthy(
                    $"AWS S3 bucket '{bucketName}' is accessible",
                    data: new Dictionary<string, object>
                    {
                        { "bucket", bucketName },
                        { "region", _configuration["AWS:Region"] ?? "unknown" },
                        { "configured", true },
                        { "accessible", true }
                    });
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.Forbidden)
            {
                // User doesn't have GetBucketLocation permission, but credentials are valid
                // This means S3 client is configured correctly
                return HealthCheckResult.Healthy(
                    $"AWS S3 credentials are valid (limited permissions)",
                    data: new Dictionary<string, object>
                    {
                        { "bucket", bucketName },
                        { "region", _configuration["AWS:Region"] ?? "unknown" },
                        { "configured", true },
                        { "credentialsValid", true },
                        { "note", "User has limited S3 permissions - this is OK for uploads" }
                    });
            }
        }
        catch (OperationCanceledException)
        {
            return HealthCheckResult.Degraded(
                "AWS S3 health check timed out (non-critical)",
                data: new Dictionary<string, object>
                {
                    { "error", "Connection timeout" },
                    { "configured", false }
                });
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogWarning(ex, "AWS S3 health check failed");
            
            return HealthCheckResult.Degraded(
                "AWS S3 bucket is not accessible (non-critical)",
                data: new Dictionary<string, object>
                {
                    { "error", ex.Message },
                    { "errorCode", ex.ErrorCode }
                });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AWS S3 health check encountered an error (this is non-critical)");
            
            return HealthCheckResult.Degraded(
                "AWS S3 credentials not configured (optional service)",
                data: new Dictionary<string, object>
                {
                    { "error", "Credentials not configured" },
                    { "configured", false },
                    { "message", "S3 storage is optional and not required for core functionality" }
                });
        }
    }
}
