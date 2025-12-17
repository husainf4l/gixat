using Gixat.Web.Data;
using Gixat.Web.Modules.Inventory.Entities;
using Gixat.Web.Modules.Inventory.Interfaces;
using Gixat.Web.Modules.Inventory.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Gixat.Web.Modules.Inventory.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InventoryItem> CreateItemAsync(InventoryItem item)
    {
        var count = await _context.InventoryItems.CountAsync();
        item.ItemNumber = $"ITEM-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D4}";
        
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<InventoryItem?> GetItemByIdAsync(Guid id)
    {
        return await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<List<InventoryItem>> GetAllItemsAsync(Guid companyId, bool activeOnly = true)
    {
        var query = _context.InventoryItems
            .Where(i => i.CompanyId == companyId);

        if (activeOnly)
        {
            query = query.Where(i => i.IsActive);
        }

        return await query
            .OrderBy(i => i.Name)
            .ToListAsync();
    }

    public async Task<List<InventoryItem>> GetLowStockItemsAsync(Guid companyId)
    {
        return await _context.InventoryItems
            .Where(i => i.CompanyId == companyId &&
                       i.IsActive &&
                       i.IsTracked &&
                       i.QuantityOnHand <= i.ReorderPoint)
            .OrderBy(i => i.QuantityOnHand)
            .ToListAsync();
    }

    public async Task<bool> UpdateItemAsync(InventoryItem item)
    {
        _context.InventoryItems.Update(item);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteItemAsync(Guid id)
    {
        var item = await GetItemByIdAsync(id);
        if (item == null) return false;

        item.IsActive = false;
        return await UpdateItemAsync(item);
    }

    public async Task<bool> AdjustStockAsync(Guid itemId, int quantity, MovementType type, string? reference = null, string? notes = null)
    {
        var item = await GetItemByIdAsync(itemId);
        if (item == null) return false;

        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            CompanyId = item.CompanyId,
            BranchId = item.BranchId,
            InventoryItemId = itemId,
            Type = type,
            Quantity = Math.Abs(quantity),
            UnitCost = item.CostPrice,
            TotalCost = Math.Abs(quantity) * item.CostPrice,
            Reference = reference,
            Notes = notes,
            MovementDate = DateTime.UtcNow
        };

        // Adjust stock based on movement type
        switch (type)
        {
            case MovementType.Purchase:
            case MovementType.Return:
            case MovementType.Adjustment when quantity > 0:
                item.QuantityOnHand += Math.Abs(quantity);
                break;
            case MovementType.Sale:
            case MovementType.Damaged:
            case MovementType.Expired:
            case MovementType.Adjustment when quantity < 0:
                item.QuantityOnHand -= Math.Abs(quantity);
                break;
        }

        movement.QuantityAfterMovement = item.QuantityOnHand;
        movement.MovementNumber = $"MOV-{DateTime.UtcNow:yyyyMMdd}-{await _context.StockMovements.CountAsync() + 1:D4}";

        _context.StockMovements.Add(movement);
        await UpdateItemAsync(item);
        
        return true;
    }

    public async Task<List<StockMovement>> GetStockHistoryAsync(Guid itemId)
    {
        return await _context.StockMovements
            .Where(m => m.InventoryItemId == itemId)
            .OrderByDescending(m => m.MovementDate)
            .ToListAsync();
    }

    public async Task<bool> RestockItemAsync(Guid itemId, int quantity, decimal unitCost)
    {
        var item = await GetItemByIdAsync(itemId);
        if (item == null) return false;

        item.CostPrice = unitCost;
        item.LastRestockDate = DateTime.UtcNow;
        
        return await AdjustStockAsync(itemId, quantity, MovementType.Purchase, "Restock", null);
    }

    public async Task<InventoryStatsDto> GetInventoryStatsAsync(Guid companyId)
    {
        var items = await _context.InventoryItems
            .Where(i => i.CompanyId == companyId)
            .ToListAsync();

        var stats = new InventoryStatsDto
        {
            TotalItems = items.Count,
            
            LowStockItems = items.Count(i => i.IsActive && i.QuantityOnHand <= i.MinimumQuantity),
            
            OutOfStockItems = items.Count(i => i.IsActive && i.QuantityOnHand == 0),
            
            TotalInventoryValue = items
                .Where(i => i.IsActive)
                .Sum(i => i.QuantityOnHand * i.CostPrice),
            
            ActiveItems = items.Count(i => i.IsActive)
        };

        return stats;
    }
}
