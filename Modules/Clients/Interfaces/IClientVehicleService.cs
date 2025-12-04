using Gixat.Web.Modules.Clients.Entities;

namespace Gixat.Web.Modules.Clients.Interfaces;

public interface IClientVehicleService
{
    Task<ClientVehicle?> GetByIdAsync(Guid id);
    Task<IEnumerable<ClientVehicle>> GetByClientIdAsync(Guid clientId);
    Task<ClientVehicle> CreateAsync(ClientVehicle vehicle);
    Task<ClientVehicle?> UpdateAsync(ClientVehicle vehicle);
    Task<bool> DeleteAsync(Guid id);
}
