using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Web.Modules.Clients.Entities;
using Gixat.Web.Modules.Clients.DTOs;
using Gixat.Web.Modules.Clients.Interfaces;
using Gixat.Web.Shared.Pagination;
using Gixat.Web.Shared.Services;

namespace Gixat.Web.Modules.Clients.Services;

public class ClientService : BaseService, IClientService
{
    private readonly ILogger<ClientService> _logger;
    private readonly PhoneNumberService _phoneService;

    public ClientService(DbContext context, ILogger<ClientService> logger, PhoneNumberService phoneService) : base(context)
    {
        _logger = logger;
        _phoneService = phoneService;
    }

    private DbSet<Client> Clients => Set<Client>();

    public async Task<Client?> GetByIdAsync(Guid id)
    {
        _logger.LogDebug("Getting client by ID: {ClientId}", id);
        return await Clients.Include(c => c.Vehicles).FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Client>> GetByCompanyIdAsync(Guid companyId)
        => await Clients
            .Include(c => c.Vehicles)
            .Where(c => c.CompanyId == companyId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<PagedResponse<Client>> GetByCompanyIdPagedAsync(Guid companyId, PagedRequest request)
    {
        _logger.LogDebug("Getting paginated clients for company {CompanyId}, page {Page}, pageSize {PageSize}", companyId, request.Page, request.PageSize);
        
        var query = Clients
            .Include(c => c.Vehicles)
            .Where(c => c.CompanyId == companyId);

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(searchTerm) ||
                c.LastName.ToLower().Contains(searchTerm) ||
                (c.Email != null && c.Email.ToLower().Contains(searchTerm)) ||
                c.Phone.Contains(searchTerm));
        }

        var totalCount = await query.CountAsync();

        // Apply sorting
        query = request.SortDescending
            ? query.OrderByDescending(c => c.CreatedAt)
            : query.OrderBy(c => c.CreatedAt);

        var items = await query
            .Skip(request.Skip)
            .Take(request.PageSize)
            .ToListAsync();

        return PagedResponse<Client>.Create(items, totalCount, request.Page, request.PageSize);
    }

    public async Task<IEnumerable<Client>> SearchAsync(Guid companyId, string? searchTerm)
    {
        var query = Clients.Include(c => c.Vehicles).Where(c => c.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(searchTerm) ||
                c.LastName.ToLower().Contains(searchTerm) ||
                (c.Email != null && c.Email.ToLower().Contains(searchTerm)) ||
                c.Phone.Contains(searchTerm));
        }

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    /// <summary>
    /// Fast search for autocomplete - returns lightweight DTOs
    /// </summary>
    public async Task<IEnumerable<ClientSearchDto>> SearchForAutocompleteAsync(Guid companyId, string? searchTerm)
    {
        Console.WriteLine($"[DEBUG ClientService] SearchForAutocompleteAsync called - CompanyId: {companyId}, SearchTerm: '{searchTerm}'");
        
        var query = Clients
            .Where(c => c.CompanyId == companyId && c.IsActive);

        var allClients = await query.ToListAsync();
        Console.WriteLine($"[DEBUG ClientService] Total active clients for company: {allClients.Count}");
        
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(searchTerm) ||
                c.LastName.ToLower().Contains(searchTerm) ||
                (c.Email != null && c.Email.ToLower().Contains(searchTerm)) ||
                c.Phone.Contains(searchTerm));
        }

        var results = await query
            .OrderByDescending(c => c.IsVip)
            .ThenByDescending(c => c.LastVisitAt)
            .Take(20) // Limit to 20 results for performance
            .Select(c => new ClientSearchDto
            {
                Id = c.Id,
                FullName = $"{c.FirstName} {c.LastName}".Trim(),
                Phone = c.Phone,
                Email = c.Email,
                IsVip = c.IsVip,
                VehicleCount = c.Vehicles.Count,
                LastVisitAt = c.LastVisitAt
            })
            .ToListAsync();
            
        Console.WriteLine($"[DEBUG ClientService] Search results count: {results.Count}");
        foreach (var r in results.Take(5))
        {
            Console.WriteLine($"[DEBUG ClientService] Result: {r.FullName} - {r.Phone}");
        }
        
        return results;
    }

    public async Task<Client> CreateAsync(Client client)
    {
        _logger.LogInformation("Creating new client for company {CompanyId}: {FirstName} {LastName}", client.CompanyId, client.FirstName, client.LastName);
        
        // Normalize phone numbers to E.164 format
        client.Phone = _phoneService.FormatToE164(client.Phone);
        if (!string.IsNullOrWhiteSpace(client.AlternatePhone))
        {
            client.AlternatePhone = _phoneService.FormatToE164(client.AlternatePhone);
        }
        
        Clients.Add(client);
        await SaveChangesAsync();
        _logger.LogInformation("Created client {ClientId}", client.Id);
        return client;
    }

    public async Task<Client?> UpdateAsync(Client client)
    {
        var existing = await Clients.FindAsync(client.Id);
        if (existing == null) return null;

        existing.FirstName = client.FirstName;
        existing.LastName = client.LastName;
        existing.Email = client.Email;
        
        // Normalize phone numbers to E.164 format
        existing.Phone = _phoneService.FormatToE164(client.Phone);
        if (!string.IsNullOrWhiteSpace(client.AlternatePhone))
        {
            existing.AlternatePhone = _phoneService.FormatToE164(client.AlternatePhone);
        }
        else
        {
            existing.AlternatePhone = client.AlternatePhone;
        }
        
        existing.Address = client.Address;
        existing.City = client.City;
        existing.State = client.State;
        existing.PostalCode = client.PostalCode;
        existing.Country = client.Country;
        existing.Notes = client.Notes;
        existing.PreferredContactMethod = client.PreferredContactMethod;
        existing.IsVip = client.IsVip;
        existing.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        _logger.LogDebug("Deleting client {ClientId}", id);
        var client = await Clients.FindAsync(id);
        if (client == null)
        {
            _logger.LogWarning("Client {ClientId} not found for deletion", id);
            return false;
        }

        Clients.Remove(client);
        await SaveChangesAsync();
        _logger.LogInformation("Deleted client {ClientId}", id);
        return true;
    }

    public async Task<bool> ActivateAsync(Guid id)
        => await SetActiveStatusAsync(id, true);

    public async Task<bool> DeactivateAsync(Guid id)
        => await SetActiveStatusAsync(id, false);

    public async Task<int> GetClientCountAsync(Guid companyId)
        => await Clients.CountAsync(c => c.CompanyId == companyId && c.IsActive);

    public async Task<ClientStatsDto> GetClientStatsAsync(Guid companyId)
    {
        var stats = await Clients
            .Where(c => c.CompanyId == companyId)
            .GroupBy(c => 1)
            .Select(g => new ClientStatsDto
            {
                TotalClients = g.Count(),
                TotalVehicles = g.Sum(c => c.Vehicles.Count),
                VipClients = g.Count(c => c.IsVip)
            })
            .FirstOrDefaultAsync();

        return stats ?? new ClientStatsDto();
    }

    private async Task<bool> SetActiveStatusAsync(Guid id, bool isActive)
    {
        var client = await Clients.FindAsync(id);
        if (client == null) return false;

        client.IsActive = isActive;
        client.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
        return true;
    }
}
