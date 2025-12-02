using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Companies.Entities;

namespace Gixat.Modules.Companies.GraphQL.Queries;

[ExtendObjectType("Query")]
public class CompanyQueries
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Company> GetCompanies([Service] DbContext context)
    {
        return context.Set<Company>();
    }

    public async Task<Company?> GetCompanyById(
        Guid id,
        [Service] DbContext context)
    {
        return await context.Set<Company>().FindAsync(id);
    }

    public async Task<Company?> GetCompanyByOwnerId(
        Guid ownerId,
        [Service] DbContext context)
    {
        return await context.Set<Company>()
            .FirstOrDefaultAsync(c => c.OwnerId == ownerId);
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Branch> GetBranches(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<Branch>().Where(b => b.CompanyId == companyId);
    }

    public async Task<Branch?> GetBranchById(
        Guid id,
        [Service] DbContext context)
    {
        return await context.Set<Branch>()
            .Include(b => b.Company)
            .FirstOrDefaultAsync(b => b.Id == id);
    }
}
