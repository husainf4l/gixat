using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Gixat.Web.Pages.Admin;

[Authorize(Roles = "Admin")]
public class HealthModel : PageModel
{
    private readonly HealthCheckService _healthCheckService;

    public HealthModel(HealthCheckService healthCheckService)
    {
        _healthCheckService = healthCheckService;
    }

    public HealthReport? HealthReport { get; set; }

    public async Task OnGetAsync()
    {
        HealthReport = await _healthCheckService.CheckHealthAsync();
    }
}
