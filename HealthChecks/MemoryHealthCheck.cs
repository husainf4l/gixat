using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;

namespace Gixat.Web.HealthChecks;

/// <summary>
/// Health check for system memory usage
/// </summary>
public class MemoryHealthCheck : IHealthCheck
{
    private readonly ILogger<MemoryHealthCheck> _logger;
    private const long UnhealthyThreshold = 1024L * 1024L * 1024L; // 1 GB
    private const long DegradedThreshold = 512L * 1024L * 1024L; // 512 MB

    public MemoryHealthCheck(ILogger<MemoryHealthCheck> logger)
    {
        _logger = logger;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        // Run on ThreadPool to avoid blocking
        return Task.Run(() =>
        {
            try
            {
                var process = Process.GetCurrentProcess();
                var allocatedMemory = process.WorkingSet64;
                var gcMemory = GC.GetTotalMemory(forceFullCollection: false);

                var data = new Dictionary<string, object>
                {
                    { "allocatedMemoryMB", allocatedMemory / 1024 / 1024 },
                    { "gcMemoryMB", gcMemory / 1024 / 1024 },
                    { "gen0Collections", GC.CollectionCount(0) },
                    { "gen1Collections", GC.CollectionCount(1) },
                    { "gen2Collections", GC.CollectionCount(2) }
                };

                if (allocatedMemory >= UnhealthyThreshold)
                {
                    return HealthCheckResult.Unhealthy(
                        $"Memory usage is critical: {allocatedMemory / 1024 / 1024} MB",
                        data: data);
                }

                if (allocatedMemory >= DegradedThreshold)
                {
                    return HealthCheckResult.Degraded(
                        $"Memory usage is high: {allocatedMemory / 1024 / 1024} MB",
                        data: data);
                }

                return HealthCheckResult.Healthy(
                    $"Memory usage is normal: {allocatedMemory / 1024 / 1024} MB",
                    data: data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Memory health check failed");
                return HealthCheckResult.Unhealthy(
                    "Memory health check failed",
                    exception: ex);
            }
        }, cancellationToken);
    }
}
