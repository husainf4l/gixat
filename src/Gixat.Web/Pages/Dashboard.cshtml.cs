using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Users.Interfaces;
using Gixat.Modules.Clients.Interfaces;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;

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

        // Get client statistics
        var clients = await _clientService.GetByCompanyIdAsync(currentCompany.CompanyId);
        var clientList = clients.ToList();
        
        TotalClients = clientList.Count;
        TotalVehicles = clientList.Sum(c => c.Vehicles?.Count ?? 0);
        VipClients = clientList.Count(c => c.IsVip);

        // Get session statistics
        var activeSessions = await _sessionService.GetActiveSessionsAsync(currentCompany.CompanyId);
        var activeList = activeSessions.ToList();
        
        ActiveSessions = activeList.Count;
        TodaySessions = activeList.Count(s => s.CheckInAt.Date == DateTime.UtcNow.Date);
        InProgressSessions = activeList.Count(s => s.Status == SessionStatus.InProgress);
        AwaitingPickup = activeList.Count(s => s.Status == SessionStatus.ReadyForPickup);
        RecentSessions = activeList.OrderByDescending(s => s.CheckInAt).Take(5).ToList();

        return Page();
    }
}
