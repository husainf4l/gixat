using MailKit.Net.Smtp;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Gixat.Web.Shared.Services;

namespace Gixat.Web.HealthChecks;

/// <summary>
/// Health check for SMTP server connectivity
/// </summary>
public class SmtpHealthCheck : IHealthCheck
{
    private readonly SmtpSettings _smtpSettings;
    private readonly ILogger<SmtpHealthCheck> _logger;

    public SmtpHealthCheck(
        IOptions<SmtpSettings> smtpSettings,
        ILogger<SmtpHealthCheck> logger)
    {
        _smtpSettings = smtpSettings.Value;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(_smtpSettings.Host) || string.IsNullOrEmpty(_smtpSettings.User))
            {
                return HealthCheckResult.Degraded(
                    "SMTP is not configured",
                    data: new Dictionary<string, object>
                    {
                        { "configured", false }
                    });
            }

            using var client = new SmtpClient();
            
            // Set timeout for health check
            client.Timeout = 5000; // 5 seconds

            // Connect to SMTP server
            if (_smtpSettings.Secure)
            {
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, true, cancellationToken);
            }
            else
            {
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, false, cancellationToken);
            }

            // Authenticate
            await client.AuthenticateAsync(_smtpSettings.User, _smtpSettings.Password, cancellationToken);

            // Disconnect
            await client.DisconnectAsync(true, cancellationToken);

            return HealthCheckResult.Healthy(
                $"SMTP server '{_smtpSettings.Host}' is accessible",
                data: new Dictionary<string, object>
                {
                    { "host", _smtpSettings.Host },
                    { "port", _smtpSettings.Port },
                    { "secure", _smtpSettings.Secure },
                    { "configured", true }
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP health check failed");
            
            return HealthCheckResult.Unhealthy(
                "SMTP server is not accessible",
                exception: ex,
                data: new Dictionary<string, object>
                {
                    { "host", _smtpSettings.Host ?? "not configured" },
                    { "error", ex.Message }
                });
        }
    }
}
