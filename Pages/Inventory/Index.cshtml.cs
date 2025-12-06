using Gixat.Web.Data;
using Gixat.Web.Modules.Inventory.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gixat.Web.Pages.Inventory;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _context;

    public IndexModel(AppDbContext context)
    {
        _context = context;
    }

    public List<InventoryItem> AllItems { get; set; } = new();
    public List<InventoryItem> LowStockItems { get; set; } = new();

    public async Task OnGetAsync()
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            AllItems = new();
            LowStockItems = new();
            return;
        }

        var companyId = Guid.Parse(companyIdClaim);

        AllItems = await _context.InventoryItems
            .Where(i => i.CompanyId == companyId)
            .OrderBy(i => i.Name)
            .ToListAsync();

        LowStockItems = AllItems
            .Where(i => i.QuantityOnHand <= i.ReorderPoint && i.IsActive)
            .ToList();
    }
}
