using Gixat.Web.Modules.Inventory.Entities;
using Gixat.Web.Modules.Inventory.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Claims;

namespace Gixat.Web.Pages.Inventory;

[Authorize]
public class CreateModel : PageModel
{
    private readonly IInventoryService _inventoryService;

    public CreateModel(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [BindProperty]
    public InventoryItemInput Input { get; set; } = new();

    public IActionResult OnGet()
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            return RedirectToPage("/Auth/Login");
        }

        // Set default values
        Input.QuantityOnHand = 0;
        Input.MinimumQuantity = 5;
        Input.MaximumQuantity = 100;
        Input.ReorderPoint = 10;
        Input.ReorderQuantity = 20;
        Input.Unit = "piece";
        Input.IsActive = true;
        Input.IsTracked = true;

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        var branchIdClaim = User.FindFirstValue("BranchId");
        
        if (string.IsNullOrEmpty(companyIdClaim) || string.IsNullOrEmpty(branchIdClaim))
        {
            return RedirectToPage("/Auth/Login");
        }

        var companyId = Guid.Parse(companyIdClaim);
        var branchId = Guid.Parse(branchIdClaim);

        if (!ModelState.IsValid)
        {
            return Page();
        }

        var item = new InventoryItem
        {
            CompanyId = companyId,
            BranchId = branchId,
            Name = Input.Name,
            Description = Input.Description,
            Barcode = Input.Barcode,
            SKU = Input.SKU,
            Category = Input.Category,
            Manufacturer = Input.Manufacturer,
            PartNumber = Input.PartNumber,
            CostPrice = Input.CostPrice,
            SellingPrice = Input.SellingPrice,
            WholesalePrice = Input.WholesalePrice,
            QuantityOnHand = Input.QuantityOnHand,
            MinimumQuantity = Input.MinimumQuantity,
            MaximumQuantity = Input.MaximumQuantity,
            ReorderPoint = Input.ReorderPoint,
            ReorderQuantity = Input.ReorderQuantity,
            Unit = Input.Unit,
            StorageLocation = Input.StorageLocation,
            Shelf = Input.Shelf,
            Bin = Input.Bin,
            IsActive = Input.IsActive,
            IsTracked = Input.IsTracked,
            SupplierName = Input.SupplierName,
            SupplierContact = Input.SupplierContact,
            Notes = Input.Notes
        };

        await _inventoryService.CreateItemAsync(item);

        return RedirectToPage("/Inventory/Index");
    }
}

public class InventoryItemInput
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    public InventoryCategory Category { get; set; }
    public string? Manufacturer { get; set; }
    public string? PartNumber { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal? WholesalePrice { get; set; }
    public int QuantityOnHand { get; set; }
    public int MinimumQuantity { get; set; }
    public int MaximumQuantity { get; set; }
    public int ReorderPoint { get; set; }
    public int ReorderQuantity { get; set; }
    public string Unit { get; set; } = "piece";
    public string? StorageLocation { get; set; }
    public string? Shelf { get; set; }
    public string? Bin { get; set; }
    public bool IsActive { get; set; }
    public bool IsTracked { get; set; }
    public string? SupplierName { get; set; }
    public string? SupplierContact { get; set; }
    public string? Notes { get; set; }
}
