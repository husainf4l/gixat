using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Users.Interfaces;
using Gixat.Web.Modules.Clients.Interfaces;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Invoices.Interfaces;
using Gixat.Web.Modules.Invoices.DTOs;
using Gixat.Web.Modules.Appointments.Interfaces;
using Gixat.Web.Modules.Appointments.DTOs;
using Gixat.Web.Modules.Inventory.Interfaces;
using Gixat.Web.Modules.Inventory.DTOs;

namespace Gixat.Web.Pages;

[Authorize]
public class DashboardModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly IClientService _clientService;
    private readonly ISessionService _sessionService;
    private readonly IInvoiceService _invoiceService;
    private readonly IAppointmentService _appointmentService;
    private readonly IInventoryService _inventoryService;

    public DashboardModel(
        ICompanyUserService companyUserService, 
        IClientService clientService,
        ISessionService sessionService,
        IInvoiceService invoiceService,
        IAppointmentService appointmentService,
        IInventoryService inventoryService)
    {
        _companyUserService = companyUserService;
        _clientService = clientService;
        _sessionService = sessionService;
        _invoiceService = invoiceService;
        _appointmentService = appointmentService;
        _inventoryService = inventoryService;
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
    
    // Invoice stats
    public decimal TodayRevenue { get; set; }
    public decimal MonthRevenue { get; set; }
    public decimal OutstandingAmount { get; set; }
    public int OverdueInvoices { get; set; }
    
    // Appointment stats
    public int TodayAppointments { get; set; }
    public int UpcomingAppointments { get; set; }
    public int PendingConfirmations { get; set; }
    
    // Inventory stats
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
    
    // Analytics
    public int WeekSessions { get; set; }
    public int MonthSessions { get; set; }
    public int CompletedThisWeek { get; set; }

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
        var invoiceStats = await _invoiceService.GetInvoiceStatsAsync(CompanyId);
        var appointmentStats = await _appointmentService.GetAppointmentStatsAsync(CompanyId);
        var inventoryStats = await _inventoryService.GetInventoryStatsAsync(CompanyId);
        var sessionAnalytics = await _sessionService.GetSessionAnalyticsAsync(CompanyId);

        // Map results
        TotalClients = clientStats.TotalClients;
        TotalVehicles = clientStats.TotalVehicles;
        VipClients = clientStats.VipClients;

        ActiveSessions = sessionStats.ActiveSessions;
        TodaySessions = sessionStats.TodaySessions;
        InProgressSessions = sessionStats.InProgressSessions;
        AwaitingPickup = sessionStats.AwaitingPickup;

        RecentSessions = recentSessions.ToList();
        
        // Invoice stats
        TodayRevenue = invoiceStats.TodayRevenue;
        MonthRevenue = invoiceStats.MonthRevenue;
        OutstandingAmount = invoiceStats.OutstandingAmount;
        OverdueInvoices = invoiceStats.OverdueInvoices;
        
        // Appointment stats
        TodayAppointments = appointmentStats.TodayAppointments;
        UpcomingAppointments = appointmentStats.UpcomingAppointments;
        PendingConfirmations = appointmentStats.PendingConfirmations;
        
        // Inventory stats
        LowStockItems = inventoryStats.LowStockItems;
        OutOfStockItems = inventoryStats.OutOfStockItems;
        
        // Analytics
        WeekSessions = sessionAnalytics.WeekSessions;
        MonthSessions = sessionAnalytics.MonthSessions;
        CompletedThisWeek = sessionAnalytics.CompletedThisWeek;

        return Page();
    }
}