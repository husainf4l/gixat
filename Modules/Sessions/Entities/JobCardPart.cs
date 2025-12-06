using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Sessions.Entities;

/// <summary>
/// Parts/inventory items used in a job card item
/// </summary>
public class JobCardPart : BaseEntity
{
    public Guid? JobCardItemId { get; set; }
    public Guid JobCardId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Part reference
    public Guid? InventoryItemId { get; set; } // Link to inventory if managed
    public string PartNumber { get; set; } = string.Empty;
    public string PartName { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Quantity
    public decimal QuantityUsed { get; set; }
    public string Unit { get; set; } = "pcs";
    
    // Pricing
    public decimal UnitCost { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Markup { get; set; } = 0;
    public decimal TotalCost { get; set; }
    public decimal TotalPrice { get; set; }
    
    // Source
    public PartSource Source { get; set; } = PartSource.InStock;
    public string? Supplier { get; set; }
    public string? SupplierPartNumber { get; set; }
    
    // Status
    public PartStatus Status { get; set; } = PartStatus.Pending;
    public DateTime? OrderedAt { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public DateTime? InstalledAt { get; set; }
    
    // Warranty
    public bool HasWarranty { get; set; } = false;
    public int WarrantyMonths { get; set; } = 0;
    public string? WarrantyInfo { get; set; }
    
    // Notes
    public string? Notes { get; set; }
    public Guid? AddedById { get; set; }
    
    // Navigation
    public virtual JobCardItem JobCardItem { get; set; } = null!;
    public virtual JobCard JobCard { get; set; } = null!;
}

public enum PartSource
{
    InStock = 0,
    OrderedFromSupplier = 1,
    CustomerProvided = 2,
    Salvaged = 3,
    Other = 4
}

public enum PartStatus
{
    Pending = 0,
    Ordered = 1,
    Received = 2,
    Installed = 3,
    Returned = 4,
    Cancelled = 5
}
