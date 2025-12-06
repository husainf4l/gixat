using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Clients.Entities;
using Gixat.Web.Modules.Clients.Interfaces;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Clients;

[Authorize]
public class IndexModel : PageModel
{
    private readonly IClientService _clientService;
    private readonly ICompanyUserService _companyUserService;

    public IndexModel(IClientService clientService, ICompanyUserService companyUserService)
    {
        _clientService = clientService;
        _companyUserService = companyUserService;
    }

    public IEnumerable<Client> Clients { get; set; } = new List<Client>();
    public string? SearchTerm { get; set; }
    public Guid CurrentCompanyId { get; set; }

    public async Task<IActionResult> OnGetAsync(string? search)
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
            return RedirectToPage("/Setup/Company");
        }

        CurrentCompanyId = currentCompany.CompanyId;
        SearchTerm = search;

        if (!string.IsNullOrEmpty(search))
        {
            Clients = await _clientService.SearchAsync(CurrentCompanyId, search);
        }
        else
        {
            Clients = await _clientService.GetByCompanyIdAsync(CurrentCompanyId);
        }

        return Page();
    }

    public async Task<IActionResult> OnPostAddClientAsync(
        string firstName,
        string lastName,
        string phone,
        string? email,
        string? address,
        string? city,
        string? state,
        string? postalCode,
        string? notes,
        bool isVip = false)
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
            return RedirectToPage("/Setup/Company");
        }

        var client = new Client
        {
            CompanyId = currentCompany.CompanyId,
            FirstName = firstName,
            LastName = lastName,
            Phone = phone,
            Email = email,
            Address = address,
            City = city,
            State = state,
            PostalCode = postalCode,
            Notes = notes,
            IsVip = isVip,
            IsActive = true
        };

        await _clientService.CreateAsync(client);

        return RedirectToPage();
    }

    /// <summary>
    /// JSON endpoint for client autocomplete search
    /// </summary>
    public async Task<IActionResult> OnGetSearchAsync(string? term)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return new JsonResult(new { error = "Unauthorized" }) { StatusCode = 401 };
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();

        if (currentCompany == null)
        {
            return new JsonResult(new { error = "No company found" }) { StatusCode = 400 };
        }

        var results = await _clientService.SearchForAutocompleteAsync(currentCompany.CompanyId, term);
        return new JsonResult(results);
    }
}
