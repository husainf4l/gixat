using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.Interfaces;

namespace Gixat.Modules.Clients.Services;

public class ClientVehicleService : IClientVehicleService
{
    private readonly DbContext _context;

    public ClientVehicleService(DbContext context)
    {
        _context = context;
    }

    private DbSet<ClientVehicle> ClientVehicles => _context.Set<ClientVehicle>();

    public async Task<ClientVehicle?> GetByIdAsync(Guid id)
    {
        return await ClientVehicles
            .Include(v => v.Client)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<IEnumerable<ClientVehicle>> GetByClientIdAsync(Guid clientId)
    {
        return await ClientVehicles
            .Where(v => v.ClientId == clientId)
            .OrderByDescending(v => v.IsPrimary)
            .ThenByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<ClientVehicle> CreateAsync(ClientVehicle vehicle)
    {
        // If this is the first vehicle, make it primary
        var existingCount = await ClientVehicles.CountAsync(v => v.ClientId == vehicle.ClientId);
        if (existingCount == 0)
        {
            vehicle.IsPrimary = true;
        }

        ClientVehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task<ClientVehicle?> UpdateAsync(ClientVehicle vehicle)
    {
        var existing = await ClientVehicles.FindAsync(vehicle.Id);
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
        var vehicle = await ClientVehicles.FindAsync(id);
        if (vehicle == null) return false;

        ClientVehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
        return true;
    }
}
