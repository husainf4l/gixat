using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Clients.Data;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.Interfaces;

namespace Gixat.Modules.Clients.Services;

public class ClientVehicleService : IClientVehicleService
{
    private readonly ClientDbContext _context;

    public ClientVehicleService(ClientDbContext context)
    {
        _context = context;
    }

    public async Task<ClientVehicle?> GetByIdAsync(Guid id)
    {
        return await _context.ClientVehicles
            .Include(v => v.Client)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<IEnumerable<ClientVehicle>> GetByClientIdAsync(Guid clientId)
    {
        return await _context.ClientVehicles
            .Where(v => v.ClientId == clientId)
            .OrderByDescending(v => v.IsPrimary)
            .ThenByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<ClientVehicle> CreateAsync(ClientVehicle vehicle)
    {
        // If this is the first vehicle, make it primary
        var existingCount = await _context.ClientVehicles.CountAsync(v => v.ClientId == vehicle.ClientId);
        if (existingCount == 0)
        {
            vehicle.IsPrimary = true;
        }

        _context.ClientVehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task<ClientVehicle?> UpdateAsync(ClientVehicle vehicle)
    {
        var existing = await _context.ClientVehicles.FindAsync(vehicle.Id);
        if (existing == null) return null;

        existing.Make = vehicle.Make;
        existing.Model = vehicle.Model;
        existing.Year = vehicle.Year;
        existing.Color = vehicle.Color;
        existing.LicensePlate = vehicle.LicensePlate;
        existing.Vin = vehicle.Vin;
        existing.EngineType = vehicle.EngineType;
        existing.Transmission = vehicle.Transmission;
        existing.Mileage = vehicle.Mileage;
        existing.Notes = vehicle.Notes;
        existing.IsPrimary = vehicle.IsPrimary;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var vehicle = await _context.ClientVehicles.FindAsync(id);
        if (vehicle == null) return false;

        _context.ClientVehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
        return true;
    }
}
