using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.DTOs;

namespace Gixat.Modules.Clients.GraphQL.Queries;

[ExtendObjectType("Query")]
public class ClientQueries
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Client> GetClients(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<Client>().Where(c => c.CompanyId == companyId);
    }

    public async Task<Client?> GetClientById(
        Guid id,
        [Service] DbContext context)
    {
        return await context.Set<Client>()
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Client> GetActiveClients(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<Client>().Where(c => c.CompanyId == companyId && c.IsActive);
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Client> GetVipClients(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<Client>().Where(c => c.CompanyId == companyId && c.IsVip && c.IsActive);
    }

    public async Task<ClientStats> GetClientStats(
        Guid companyId,
        [Service] DbContext context)
    {
        var clients = await context.Set<Client>()
            .Where(c => c.CompanyId == companyId && c.IsActive)
            .ToListAsync();

        return new ClientStats
        {
            TotalClients = clients.Count,
            VipClients = clients.Count(c => c.IsVip),
            TotalRevenue = clients.Sum(c => c.TotalSpent),
            AverageRevenue = clients.Any() ? clients.Average(c => c.TotalSpent) : 0
        };
    }

    // Public stats for homepage (aggregate across all companies)
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public async Task<PlatformStats> GetPlatformStats([Service] DbContext context)
    {
        var allClients = await context.Set<Client>()
            .Where(c => c.IsActive)
            .ToListAsync();

        var totalCompanies = await context.Set<Client>()
            .Select(c => c.CompanyId)
            .Distinct()
            .CountAsync();

        return new PlatformStats
        {
            TotalClients = allClients.Count,
            TotalCompanies = totalCompanies,
            TotalRevenue = allClients.Sum(c => c.TotalSpent),
            AverageRevenuePerClient = allClients.Any() ? allClients.Average(c => c.TotalSpent) : 0
        };
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<ClientVehicle> GetClientVehicles(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<ClientVehicle>().Where(v => v.CompanyId == companyId);
    }

    public async Task<ClientVehicle?> GetClientVehicleById(
        Guid id,
        [Service] DbContext context)
    {
        return await context.Set<ClientVehicle>()
            .Include(v => v.Client)
            .FirstOrDefaultAsync(v => v.Id == id);
    }
}