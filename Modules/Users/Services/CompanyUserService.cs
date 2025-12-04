using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Web.Modules.Users.Entities;
using Gixat.Web.Modules.Users.Interfaces;
using Gixat.Web.Shared.Services;

namespace Gixat.Web.Modules.Users.Services;

public class CompanyUserService : BaseService, ICompanyUserService
{
    private readonly ILogger<CompanyUserService> _logger;

    public CompanyUserService(DbContext context, ILogger<CompanyUserService> logger) : base(context)
    {
        _logger = logger;
    }

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
        _logger.LogInformation("Creating company user for company {CompanyId}, auth user {AuthUserId}", companyUser.CompanyId, companyUser.AuthUserId);
        CompanyUsers.Add(companyUser);
        await SaveChangesAsync();
        _logger.LogInformation("Created company user {CompanyUserId}", companyUser.Id);
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
