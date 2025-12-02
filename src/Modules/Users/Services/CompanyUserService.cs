using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Users.Entities;
using Gixat.Modules.Users.Interfaces;
using Gixat.Shared.Services;

namespace Gixat.Modules.Users.Services;

public class CompanyUserService : BaseService, ICompanyUserService
{
    public CompanyUserService(DbContext context) : base(context) { }

    private DbSet<CompanyUser> CompanyUsers => Set<CompanyUser>();

    public async Task<CompanyUser?> GetByIdAsync(Guid id)
        => await CompanyUsers.FindAsync(id);

    public async Task<CompanyUser?> GetByAuthUserIdAndCompanyIdAsync(Guid authUserId, Guid companyId)
        => await CompanyUsers.FirstOrDefaultAsync(u => u.AuthUserId == authUserId && u.CompanyId == companyId);

    public async Task<IEnumerable<CompanyUser>> GetByCompanyIdAsync(Guid companyId)
        => await CompanyUsers.Where(u => u.CompanyId == companyId).ToListAsync();

    public async Task<IEnumerable<CompanyUser>> GetUserCompaniesAsync(Guid authUserId)
        => await CompanyUsers.Where(u => u.AuthUserId == authUserId && u.IsActive).ToListAsync();

    public async Task<CompanyUser> CreateCompanyUserAsync(CompanyUser companyUser)
    {
        CompanyUsers.Add(companyUser);
        await SaveChangesAsync();
        return companyUser;
    }

    public async Task<CompanyUser?> UpdateAsync(CompanyUser companyUser)
    {
        var existing = await CompanyUsers.FindAsync(companyUser.Id);
        if (existing == null) return null;

        Context.Entry(existing).CurrentValues.SetValues(companyUser);
        existing.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await CompanyUsers.FindAsync(id);
        if (user == null) return false;

        CompanyUsers.Remove(user);
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateAsync(Guid id)
        => await SetActiveStatusAsync(id, false);

    public async Task<bool> ActivateAsync(Guid id)
        => await SetActiveStatusAsync(id, true);

    private async Task<bool> SetActiveStatusAsync(Guid id, bool isActive)
    {
        var user = await CompanyUsers.FindAsync(id);
        if (user == null) return false;

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
        return true;
    }
}
