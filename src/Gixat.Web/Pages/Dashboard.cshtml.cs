using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Users.Interfaces;
using Gixat.Modules.Clients.Interfaces;

namespace Gixat.Web.Pages;

[Authorize]
public class DashboardModel : PageModel
{
    private readonly ICompanyUserService _companyUserService;
    private readonly IClientService _clientService;

    public DashboardModel(ICompanyUserService companyUserService, IClientService clientService)
    {
        _companyUserService = companyUserService;
        _clientService = clientService;
    }

    public string CompanyName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public int TotalClients { get; set; }
    public int TotalVehicles { get; set; }
    public int VipClients { get; set; }

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

        UserRole = currentCompany.Role.ToString();

        // Get statistics
        var clients = await _clientService.GetByCompanyIdAsync(currentCompany.CompanyId);
        var clientList = clients.ToList();
        
        TotalClients = clientList.Count;
        TotalVehicles = clientList.Sum(c => c.Vehicles?.Count ?? 0);
        VipClients = clientList.Count(c => c.IsVip);

        return Page();
    }
}
