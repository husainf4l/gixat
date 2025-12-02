using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Users.Data;
using Gixat.Modules.Users.Entities;

namespace Gixat.Modules.Users.GraphQL.Queries;

[ExtendObjectType("Query")]
public class UserQueries
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<CompanyUser> GetCompanyUsers(
        Guid companyId,
        [Service] UserDbContext context)
    {
        return context.CompanyUsers.Where(u => u.CompanyId == companyId);
    }

    public async Task<CompanyUser?> GetCompanyUserById(
        Guid id,
        [Service] UserDbContext context)
    {
        return await context.CompanyUsers.FindAsync(id);
    }

    public async Task<CompanyUser?> GetCompanyUserByAuthId(
        Guid authUserId,
        Guid companyId,
        [Service] UserDbContext context)
    {
        return await context.CompanyUsers
            .FirstOrDefaultAsync(u => u.AuthUserId == authUserId && u.CompanyId == companyId);
    }

    public async Task<IEnumerable<CompanyUser>> GetUserCompanies(
        Guid authUserId,
        [Service] UserDbContext context)
    {
        return await context.CompanyUsers
            .Where(u => u.AuthUserId == authUserId && u.IsActive)
            .ToListAsync();
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<CompanyUser> GetTechnicians(
        Guid companyId,
        [Service] UserDbContext context)
    {
        return context.CompanyUsers
            .Where(u => u.CompanyId == companyId && 
                        u.Role == CompanyUserRole.Technician && 
                        u.IsActive);
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<UserInvitation> GetPendingInvitations(
        Guid companyId,
        [Service] UserDbContext context)
    {
        return context.UserInvitations
            .Where(i => i.CompanyId == companyId && 
                        i.Status == InvitationStatus.Pending);
    }
}
