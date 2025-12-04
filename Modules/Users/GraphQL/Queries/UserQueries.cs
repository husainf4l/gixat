using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Modules.Users.Entities;

namespace Gixat.Web.Modules.Users.GraphQL.Queries;

[ExtendObjectType("Query")]
public class UserQueries
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<CompanyUser> GetCompanyUsers(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<CompanyUser>().Where(u => u.CompanyId == companyId);
    }

    public async Task<CompanyUser?> GetCompanyUserById(
        Guid id,
        [Service] DbContext context)
    {
        return await context.Set<CompanyUser>().FindAsync(id);
    }

    public async Task<CompanyUser?> GetCompanyUserByAuthId(
        Guid authUserId,
        Guid companyId,
        [Service] DbContext context)
    {
        return await context.Set<CompanyUser>()
            .FirstOrDefaultAsync(u => u.AuthUserId == authUserId && u.CompanyId == companyId);
    }

    public async Task<IEnumerable<CompanyUser>> GetUserCompanies(
        Guid authUserId,
        [Service] DbContext context)
    {
        return await context.Set<CompanyUser>()
            .Where(u => u.AuthUserId == authUserId && u.IsActive)
            .ToListAsync();
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<CompanyUser> GetTechnicians(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<CompanyUser>()
            .Where(u => u.CompanyId == companyId && 
                        u.Role == CompanyUserRole.Technician && 
                        u.IsActive);
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<UserInvitation> GetPendingInvitations(
        Guid companyId,
        [Service] DbContext context)
    {
        return context.Set<UserInvitation>()
            .Where(i => i.CompanyId == companyId && 
                        i.Status == InvitationStatus.Pending);
    }
}
