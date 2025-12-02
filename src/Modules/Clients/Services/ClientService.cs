using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.Interfaces;

namespace Gixat.Modules.Clients.Services;

public class ClientService : IClientService
{
    private readonly DbContext _context;

    public ClientService(DbContext context)
    {
        _context = context;
    }

    private DbSet<Client> Clients => _context.Set<Client>();
    private DbSet<ClientVehicle> ClientVehicles => _context.Set<ClientVehicle>();

    public async Task<Client?> GetByIdAsync(Guid id)
    {
        return await Clients
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Client>> GetByCompanyIdAsync(Guid companyId)
    {
        return await Clients
            .Include(c => c.Vehicles)
            .Where(c => c.CompanyId == companyId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Client>> SearchAsync(Guid companyId, string? searchTerm)
    {
        var query = Clients
            .Include(c => c.Vehicles)
            .Where(c => c.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(searchTerm) ||
                c.LastName.ToLower().Contains(searchTerm) ||
                (c.Email != null && c.Email.ToLower().Contains(searchTerm)) ||
                c.Phone.Contains(searchTerm));
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Client> CreateAsync(Client client)
    {
        Clients.Add(client);
        await _context.SaveChangesAsync();
        return client;
    }

    public async Task<Client?> UpdateAsync(Client client)
    {
        var existing = await Clients.FindAsync(client.Id);
        if (existing == null) return null;

        existing.FirstName = client.FirstName;
        existing.LastName = client.LastName;
        existing.Email = client.Email;
        existing.Phone = client.Phone;
        existing.AlternatePhone = client.AlternatePhone;
        existing.Address = client.Address;
        existing.City = client.City;
        existing.State = client.State;
        existing.PostalCode = client.PostalCode;
        existing.Country = client.Country;
        existing.Notes = client.Notes;
        existing.PreferredContactMethod = client.PreferredContactMethod;
        existing.IsVip = client.IsVip;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var client = await Clients.FindAsync(id);
        if (client == null) return false;

        Clients.Remove(client);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ActivateAsync(Guid id)
    {
        var client = await Clients.FindAsync(id);
        if (client == null) return false;

        client.IsActive = true;
        client.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateAsync(Guid id)
    {
        var client = await Clients.FindAsync(id);
        if (client == null) return false;

        client.IsActive = false;
        client.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetClientCountAsync(Guid companyId)
    {
        return await Clients.CountAsync(c => c.CompanyId == companyId && c.IsActive);
    }
}
