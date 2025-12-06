using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Inventory.Entities;

public class InventoryItem : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    
    // Product Info
    public string ItemNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    
    // Category
    public InventoryCategory Category { get; set; }
    public string? Manufacturer { get; set; }
    public string? PartNumber { get; set; }
    
    // Pricing
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal? WholesalePrice { get; set; }
    
    // Stock
    public int QuantityOnHand { get; set; }
    public int MinimumQuantity { get; set; } = 5;
    public int MaximumQuantity { get; set; } = 100;
    public int ReorderPoint { get; set; } = 10;
    public int ReorderQuantity { get; set; } = 20;
    
    // Unit
    public string Unit { get; set; } = "piece"; // piece, liter, kg, etc.
    
    // Location
    public string? StorageLocation { get; set; }
    public string? Shelf { get; set; }
    public string? Bin { get; set; }
    
    // Status
    public bool IsActive { get; set; } = true;
    public bool IsTracked { get; set; } = true;
    
    // Supplier
    public string? SupplierName { get; set; }
    public string? SupplierContact { get; set; }
    
    // Additional Info
    public string? Notes { get; set; }
    public DateTime? LastRestockDate { get; set; }
}

public enum InventoryCategory
{
    Parts,
    Fluids,
    Filters,
    Tires,
    Batteries,
    BrakePads,
    Accessories,
    Tools,
    Chemicals,
    Other
}
