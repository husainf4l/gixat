using Gixat.Modules.Clients.Entities;

namespace Gixat.Modules.Clients.Interfaces;

public interface IClientVehicleService
{
    Task<ClientVehicle?> GetByIdAsync(Guid id);
    Task<IEnumerable<ClientVehicle>> GetByClientIdAsync(Guid clientId);
    Task<ClientVehicle> CreateAsync(ClientVehicle vehicle);
    Task<ClientVehicle?> UpdateAsync(ClientVehicle vehicle);
    Task<bool> DeleteAsync(Guid id);
}
