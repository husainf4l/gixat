namespace Gixat.Web.Modules.Inventory.DTOs;

public class InventoryStatsDto
{
    public int TotalItems { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int ActiveItems { get; set; }
}
