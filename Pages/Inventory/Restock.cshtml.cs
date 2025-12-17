using Gixat.Web.Data;
using Gixat.Web.Modules.Inventory.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gixat.Web.Pages.Inventory;

[Authorize]
public class RestockModel : PageModel
{
    private readonly AppDbContext _context;

    public RestockModel(AppDbContext context)
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

    public async Task<IActionResult> OnPostAsync(
        Guid ItemId,
        int QuantityToAdd,
        decimal UnitCost,
        string? Supplier,
        string? ReferenceNumber,
        string? Notes)
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            return RedirectToPage("/Auth/Login");
        }

        var companyId = Guid.Parse(companyIdClaim);

        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == ItemId && i.CompanyId == companyId);

        if (item == null)
        {
            TempData["Error"] = "Item not found";
            return RedirectToPage("Index");
        }

        // Update quantity
        item.QuantityOnHand += QuantityToAdd;
        
        // Update cost price if changed
        if (UnitCost > 0 && UnitCost != item.CostPrice)
        {
            item.CostPrice = UnitCost;
        }

        // Update supplier if provided
        if (!string.IsNullOrEmpty(Supplier))
        {
            item.SupplierName = Supplier;
        }

        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        TempData["Success"] = $"Successfully added {QuantityToAdd} {item.Unit} to {item.Name}";
        return RedirectToPage("Details", new { id = ItemId });
    }
}
