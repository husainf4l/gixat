using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.Interfaces;
using Gixat.Shared.Services;

namespace Gixat.Modules.Clients.Services;

public class ClientVehicleService : BaseService, IClientVehicleService
{
    private readonly ILogger<ClientVehicleService> _logger;

    public ClientVehicleService(DbContext context, ILogger<ClientVehicleService> logger) : base(context)
    {
        _logger = logger;
    }

    private DbSet<ClientVehicle> ClientVehicles => Set<ClientVehicle>();

    public async Task<ClientVehicle?> GetByIdAsync(Guid id)
        => await ClientVehicles.Include(v => v.Client).FirstOrDefaultAsync(v => v.Id == id);

    public async Task<IEnumerable<ClientVehicle>> GetByClientIdAsync(Guid clientId)
        => await ClientVehicles
            .Where(v => v.ClientId == clientId)
            .OrderByDescending(v => v.IsPrimary)
            .ThenByDescending(v => v.CreatedAt)
            .ToListAsync();

    public async Task<ClientVehicle> CreateAsync(ClientVehicle vehicle)
    {
        _logger.LogInformation("Creating vehicle for client {ClientId}: {Make} {Model} {Year}", vehicle.ClientId, vehicle.Make, vehicle.Model, vehicle.Year);
        // If this is the first vehicle, make it primary
        var existingCount = await ClientVehicles.CountAsync(v => v.ClientId == vehicle.ClientId);
        if (existingCount == 0)
        {
            vehicle.IsPrimary = true;
        }

        ClientVehicles.Add(vehicle);
        await SaveChangesAsync();
        _logger.LogInformation("Created vehicle {VehicleId}", vehicle.Id);
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

        await SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var vehicle = await ClientVehicles.FindAsync(id);
        if (vehicle == null) return false;

        ClientVehicles.Remove(vehicle);
        await SaveChangesAsync();
        return true;
    }
}
