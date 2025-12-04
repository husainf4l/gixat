using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Users.Interfaces;
using Gixat.Web.Modules.Clients.Interfaces;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Pages;

[Authorize]
public class DashboardModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly IClientService _clientService;
    private readonly ISessionService _sessionService;

    public DashboardModel(
        ICompanyUserService companyUserService, 
        IClientService clientService,
        ISessionService sessionService)
    {
        _companyUserService = companyUserService;
        _clientService = clientService;
        _sessionService = sessionService;
    }

    public string CompanyName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public Guid CompanyId { get; set; }
    public int TotalClients { get; set; }
    public int TotalVehicles { get; set; }
    public int VipClients { get; set; }
    
    // Session stats
    public int ActiveSessions { get; set; }
    public int TodaySessions { get; set; }
    public int InProgressSessions { get; set; }
    public int AwaitingPickup { get; set; }
    public List<SessionDto> RecentSessions { get; set; } = new();

    public async Task<IActionResult> OnGetAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();

        if (currentCompany == null)
        {
            // User has no company, redirect to setup
            return RedirectToPage("/Setup/Company");
        }

        CompanyId = currentCompany.CompanyId;
        UserRole = currentCompany.Role.ToString();

        // Run queries sequentially - DbContext is not thread-safe
        var clientStats = await _clientService.GetClientStatsAsync(CompanyId);
        var sessionStats = await _sessionService.GetSessionStatsAsync(CompanyId);
        var recentSessions = await _sessionService.GetRecentSessionsAsync(CompanyId, 5);

        // Map results
        TotalClients = clientStats.TotalClients;
        TotalVehicles = clientStats.TotalVehicles;
        VipClients = clientStats.VipClients;

        ActiveSessions = sessionStats.ActiveSessions;
        TodaySessions = sessionStats.TodaySessions;
        InProgressSessions = sessionStats.InProgressSessions;
        AwaitingPickup = sessionStats.AwaitingPickup;

        RecentSessions = recentSessions.ToList();

        return Page();
    }
}
