using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Gixat.Web.Pages
{
    public class HealthUIModel : PageModel
    {
        private readonly HealthCheckService _healthCheckService;

        public HealthUIModel(HealthCheckService healthCheckService)
        {
            _healthCheckService = healthCheckService;
        }

        public string OverallStatus { get; set; } = "Unknown";
        public List<HealthCheckInfo> HealthChecks { get; set; } = new();
        public int HealthyCount => HealthChecks.Count(h => h.Status == "Healthy");
        public int DegradedCount => HealthChecks.Count(h => h.Status == "Degraded");
        public int UnhealthyCount => HealthChecks.Count(h => h.Status == "Unhealthy");
        public TimeSpan TotalDuration => TimeSpan.FromMilliseconds(HealthChecks.Sum(h => h.Duration.TotalMilliseconds));

        public async Task OnGetAsync()
        {
            var healthReport = await _healthCheckService.CheckHealthAsync();

            OverallStatus = healthReport.Status switch
            {
                HealthStatus.Healthy => "Healthy",
                HealthStatus.Degraded => "Degraded",
                HealthStatus.Unhealthy => "Unhealthy",
                _ => "Unknown"
            };

            HealthChecks = healthReport.Entries.Select(entry => new HealthCheckInfo
            {
                Name = entry.Key,
                Status = entry.Value.Status switch
                {
                    HealthStatus.Healthy => "Healthy",
                    HealthStatus.Degraded => "Degraded",
                    HealthStatus.Unhealthy => "Unhealthy",
                    _ => "Unknown"
                },
                Description = entry.Value.Description ?? "",
                Duration = entry.Value.Duration,
                Error = entry.Value.Exception?.Message ?? "",
                Tags = entry.Value.Tags.ToList()
            }).ToList();
        }

        public class HealthCheckInfo
        {
            public string Name { get; set; } = "";
            public string Status { get; set; } = "";
            public string Description { get; set; } = "";
            public TimeSpan Duration { get; set; }
            public string Error { get; set; } = "";
            public List<string> Tags { get; set; } = new();
        }
    }
}
