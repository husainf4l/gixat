using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Inventory.Entities;

public class StockMovement : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    public Guid InventoryItemId { get; set; }
    
    public string MovementNumber { get; set; } = string.Empty;
    public MovementType Type { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    
    // Reference
    public Guid? SessionId { get; set; }
    public Guid? InvoiceId { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    
    // Stock levels after this movement
    public int QuantityAfterMovement { get; set; }
    
    // Navigation
    public InventoryItem? InventoryItem { get; set; }
}

public enum MovementType
{
    Purchase,
    Sale,
    Adjustment,
    Return,
    Transfer,
    Damaged,
    Expired
}
