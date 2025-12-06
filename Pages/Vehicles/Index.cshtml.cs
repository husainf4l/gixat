using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Data;

namespace Gixat.Web.Pages.Vehicles;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _context;

    public IndexModel(AppDbContext context)
    {
        _context = context;
    }

    public List<VehicleViewModel> Vehicles { get; set; } = new();
    public string SearchTerm { get; set; } = string.Empty;
    public int CurrentPage { get; set; } = 1;
    public int TotalPages { get; set; }
    public int PageSize { get; set; } = 12;

    public async Task OnGetAsync(string? searchTerm, int page = 1)
    {
        SearchTerm = searchTerm ?? string.Empty;
        CurrentPage = page;

        var query = _context.ClientVehicles
            .Include(v => v.Client)
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(SearchTerm))
        {
            var search = SearchTerm.ToLower();
            query = query.Where(v =>
                v.LicensePlate != null && v.LicensePlate.ToLower().Contains(search) ||
                v.Vin != null && v.Vin.ToLower().Contains(search) ||
                v.Make != null && v.Make.ToLower().Contains(search) ||
                v.Model != null && v.Model.ToLower().Contains(search) ||
                v.Color != null && v.Color.ToLower().Contains(search));
        }

        // Get total count for pagination
        var totalCount = await query.CountAsync();
        TotalPages = (int)Math.Ceiling(totalCount / (double)PageSize);

        // Get paginated vehicles
        var vehicles = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((CurrentPage - 1) * PageSize)
            .Take(PageSize)
            .Select(v => new VehicleViewModel
            {
                Id = v.Id,
                Year = v.Year,
                Make = v.Make ?? "Unknown",
                Model = v.Model ?? "Unknown",
                LicensePlate = v.LicensePlate,
                Vin = v.Vin,
                Color = v.Color,
                Mileage = v.Mileage,
                EngineType = v.EngineType,
                Transmission = v.Transmission,
                IsPrimary = v.IsPrimary,
                IsActive = v.IsActive,
                ClientId = v.ClientId,
                ClientName = $"{v.Client!.FirstName} {v.Client.LastName}",
                ClientPhone = v.Client.Phone,
                ActiveSessionCount = _context.GarageSessions
                    .Count(s => s.ClientVehicleId == v.Id && 
                               s.Status != Modules.Sessions.Enums.SessionStatus.Completed &&
                               s.Status != Modules.Sessions.Enums.SessionStatus.Cancelled)
            })
            .ToListAsync();

        Vehicles = vehicles;
    }

    public class VehicleViewModel
    {
        public Guid Id { get; set; }
        public int? Year { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string? LicensePlate { get; set; }
        public string? Vin { get; set; }
        public string? Color { get; set; }
        public int? Mileage { get; set; }
        public string? EngineType { get; set; }
        public string? Transmission { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsActive { get; set; }
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? ClientPhone { get; set; }
        public int ActiveSessionCount { get; set; }
    }
}
