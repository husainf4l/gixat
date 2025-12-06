using Gixat.Web.Modules.Inventory.Entities;

namespace Gixat.Web.Modules.Inventory.Interfaces;

public interface IInventoryService
{
    Task<InventoryItem> CreateItemAsync(InventoryItem item);
    Task<InventoryItem?> GetItemByIdAsync(Guid id);
    Task<List<InventoryItem>> GetAllItemsAsync(Guid companyId, bool activeOnly = true);
    Task<List<InventoryItem>> GetLowStockItemsAsync(Guid companyId);
    Task<bool> UpdateItemAsync(InventoryItem item);
    Task<bool> DeleteItemAsync(Guid id);
    
    // Stock Management
    Task<bool> AdjustStockAsync(Guid itemId, int quantity, MovementType type, string? reference = null, string? notes = null);
    Task<List<StockMovement>> GetStockHistoryAsync(Guid itemId);
    Task<bool> RestockItemAsync(Guid itemId, int quantity, decimal unitCost);
}
