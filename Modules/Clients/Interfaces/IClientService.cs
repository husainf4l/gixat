using Gixat.Web.Modules.Clients.Entities;
using Gixat.Web.Modules.Clients.DTOs;
using Gixat.Web.Shared.Pagination;

namespace Gixat.Web.Modules.Clients.Interfaces;

public interface IClientService
{
    Task<Client?> GetByIdAsync(Guid id);
    Task<IEnumerable<Client>> GetByCompanyIdAsync(Guid companyId);
    Task<PagedResponse<Client>> GetByCompanyIdPagedAsync(Guid companyId, PagedRequest request);
    Task<IEnumerable<Client>> SearchAsync(Guid companyId, string? searchTerm);
    Task<Client> CreateAsync(Client client);
    Task<Client?> UpdateAsync(Client client);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ActivateAsync(Guid id);
    Task<bool> DeactivateAsync(Guid id);
    Task<int> GetClientCountAsync(Guid companyId);
    Task<ClientStatsDto> GetClientStatsAsync(Guid companyId);
}
