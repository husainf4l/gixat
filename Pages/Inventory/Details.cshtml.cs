using Gixat.Web.Data;
using Gixat.Web.Modules.Inventory.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gixat.Web.Pages.Inventory;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly AppDbContext _context;

    public DetailsModel(AppDbContext context)
    {
        _context = context;
    }

    public InventoryItem? Item { get; set; }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            return RedirectToPage("/Auth/Login");
        }

        var companyId = Guid.Parse(companyIdClaim);

        Item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);

        if (Item == null)
        {
            return Page();
        }

        return Page();
    }

    public async Task<IActionResult> OnPostUpdateAsync(
        Guid Id,
        string Name,
        string Category,
        string? Description,
        int QuantityOnHand,
        int MinimumQuantity,
        int ReorderPoint,
        decimal CostPrice,
        decimal SellingPrice,
        string? StorageLocation,
        string? Shelf,
        bool IsActive = false)
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            return RedirectToPage("/Auth/Login");
        }

        var companyId = Guid.Parse(companyIdClaim);

        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == Id && i.CompanyId == companyId);

        if (item == null)
        {
            TempData["Error"] = "Item not found";
            return RedirectToPage("Index");
        }

        item.Name = Name;
        if (Enum.TryParse<InventoryCategory>(Category, out var categoryEnum))
        {
            item.Category = categoryEnum;
        }
        item.Description = Description;
        item.QuantityOnHand = QuantityOnHand;
        item.MinimumQuantity = MinimumQuantity;
        item.ReorderPoint = ReorderPoint;
        item.CostPrice = CostPrice;
        item.SellingPrice = SellingPrice;
        item.StorageLocation = StorageLocation;
        item.Shelf = Shelf;
        item.IsActive = IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        TempData["Success"] = "Item updated successfully";
        return RedirectToPage("Details", new { id = Id });
    }
}
