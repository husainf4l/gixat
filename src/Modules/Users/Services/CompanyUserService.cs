using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Users.Entities;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Modules.Users.Services;

public class CompanyUserService : ICompanyUserService
{
    private readonly DbContext _context;

    public CompanyUserService(DbContext context)
    {
        _context = context;
    }

    private DbSet<CompanyUser> CompanyUsers => _context.Set<CompanyUser>();

    public async Task<CompanyUser?> GetByIdAsync(Guid id)
    {
        return await CompanyUsers.FindAsync(id);
    }

    public async Task<CompanyUser?> GetByAuthUserIdAndCompanyIdAsync(Guid authUserId, Guid companyId)
    {
        return await CompanyUsers
            .FirstOrDefaultAsync(u => u.AuthUserId == authUserId && u.CompanyId == companyId);
    }

    public async Task<IEnumerable<CompanyUser>> GetByCompanyIdAsync(Guid companyId)
    {
        return await CompanyUsers
            .Where(u => u.CompanyId == companyId)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetUserCompaniesAsync(Guid authUserId)
    {
        return await CompanyUsers
            .Where(u => u.AuthUserId == authUserId && u.IsActive)
            .ToListAsync();
    }

    public async Task<CompanyUser> CreateCompanyUserAsync(CompanyUser companyUser)
    {
        CompanyUsers.Add(companyUser);
        await _context.SaveChangesAsync();
        return companyUser;
    }

    public async Task<CompanyUser?> UpdateAsync(CompanyUser companyUser)
    {
        var existing = await CompanyUsers.FindAsync(companyUser.Id);
        if (existing == null) return null;

        _context.Entry(existing).CurrentValues.SetValues(companyUser);
        existing.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await CompanyUsers.FindAsync(id);
        if (user == null) return false;

        CompanyUsers.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateAsync(Guid id)
    {
        var user = await CompanyUsers.FindAsync(id);
        if (user == null) return false;

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ActivateAsync(Guid id)
    {
        var user = await CompanyUsers.FindAsync(id);
        if (user == null) return false;

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
