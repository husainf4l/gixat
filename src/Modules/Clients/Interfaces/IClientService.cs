using Gixat.Modules.Clients.Entities;

namespace Gixat.Modules.Clients.Interfaces;

public interface IClientService
{
    Task<Client?> GetByIdAsync(Guid id);
    Task<IEnumerable<Client>> GetByCompanyIdAsync(Guid companyId);
    Task<IEnumerable<Client>> SearchAsync(Guid companyId, string? searchTerm);
    Task<Client> CreateAsync(Client client);
    Task<Client?> UpdateAsync(Client client);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ActivateAsync(Guid id);
    Task<bool> DeactivateAsync(Guid id);
    Task<int> GetClientCountAsync(Guid companyId);
}
