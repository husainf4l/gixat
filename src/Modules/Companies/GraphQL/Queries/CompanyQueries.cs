using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Companies.Data;
using Gixat.Modules.Companies.Entities;

namespace Gixat.Modules.Companies.GraphQL.Queries;

[ExtendObjectType("Query")]
public class CompanyQueries
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Company> GetCompanies([Service] CompanyDbContext context)
    {
        return context.Companies;
    }

    public async Task<Company?> GetCompanyById(
        Guid id,
        [Service] CompanyDbContext context)
    {
        return await context.Companies.FindAsync(id);
    }

    public async Task<Company?> GetCompanyByOwnerId(
        Guid ownerId,
        [Service] CompanyDbContext context)
    {
        return await context.Companies
            .FirstOrDefaultAsync(c => c.OwnerId == ownerId);
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Branch> GetBranches(
        Guid companyId,
        [Service] CompanyDbContext context)
    {
        return context.Branches.Where(b => b.CompanyId == companyId);
    }

    public async Task<Branch?> GetBranchById(
        Guid id,
        [Service] CompanyDbContext context)
    {
        return await context.Branches
            .Include(b => b.Company)
            .FirstOrDefaultAsync(b => b.Id == id);
    }
}
