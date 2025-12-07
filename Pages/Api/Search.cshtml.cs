using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Claims;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Clients.Interfaces;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Api
{
    public class SearchModel : PageModel
    {
        private readonly ISessionService _sessionService;
        private readonly IClientService _clientService;
        private readonly ICompanyUserService _companyUserService;

        public SearchModel(
            ISessionService sessionService,
            IClientService clientService,
            ICompanyUserService companyUserService)
        {
            _sessionService = sessionService;
            _clientService = clientService;
            _companyUserService = companyUserService;
        }

        public async Task<IActionResult> OnGetAsync(string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            {
                return new JsonResult(new { sessions = Array.Empty<object>(), clients = Array.Empty<object>(), vehicles = Array.Empty<object>() });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
            var currentCompany = userCompanies.OrderBy(x => x.CompanyId).FirstOrDefault();

            if (currentCompany == null)
            {
                return new JsonResult(new { sessions = Array.Empty<object>(), clients = Array.Empty<object>(), vehicles = Array.Empty<object>() });
            }

            var companyId = currentCompany.CompanyId;
            var query = q.ToLower();

            // Search sessions
            var sessions = await _sessionService.SearchAsync(companyId, query);
            var sessionResults = sessions.Take(5).Select(s => new
            {
                id = s.Id,
                sessionNumber = s.SessionNumber,
                status = s.Status.ToString(),
                clientName = s.ClientName,
                vehicleName = s.VehicleDisplayName
            });

            // Search clients
            var clients = await _clientService.SearchAsync(companyId, query);
            var clientResults = clients.Take(5).Select(c => new
            {
                id = c.Id,
                name = c.FullName,
                initials = $"{c.FirstName[0]}{c.LastName[0]}",
                phone = c.Phone,
                email = c.Email
            });

            // Search vehicles through all clients
            var allClients = await _clientService.GetByCompanyIdAsync(companyId);
            var vehicleResults = allClients
                .Where(c => c.Vehicles != null)
                .SelectMany(c => c.Vehicles!.Where(v => 
                    (v.Make?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (v.Model?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (v.LicensePlate?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false))
                    .Select(v => new
                    {
                        id = v.Id,
                        make = v.Make,
                        model = v.Model,
                        licensePlate = v.LicensePlate,
                        clientId = c.Id,
                        clientName = c.FullName
                    }))
                .Take(5);

            return new JsonResult(new
            {
                sessions = sessionResults,
                clients = clientResults,
                vehicles = vehicleResults
            });
        }
    }
}
