using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Modules.Companies.DTOs;
using Gixat.Modules.Companies.Entities;
using Gixat.Modules.Companies.Interfaces;
using Gixat.Shared.Services;

namespace Gixat.Modules.Companies.Services;

public class BranchService : BaseService, IBranchService
{
    private readonly ILogger<BranchService> _logger;

    public BranchService(DbContext context, ILogger<BranchService> logger) : base(context)
    {
        _logger = logger;
    }

    private DbSet<Branch> Branches => Set<Branch>();

    public async Task<BranchDto?> GetByIdAsync(Guid id)
    {
        var branch = await Branches.FindAsync(id);
        return branch?.ToDto();
    }

    public async Task<IEnumerable<BranchDto>> GetByCompanyIdAsync(Guid companyId)
    {
        var branches = await Branches
            .Where(b => b.CompanyId == companyId)
            .OrderBy(b => b.Name)
            .ToListAsync();
        return branches.Select(b => b.ToDto());
    }

    public async Task<BranchDto> CreateAsync(Guid companyId, CreateBranchDto dto)
    {
        _logger.LogInformation("Creating branch {BranchName} for company {CompanyId}", dto.Name, companyId);
        var branch = new Branch
        {
            CompanyId = companyId,
            Name = dto.Name,
            Code = dto.Code,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            PostalCode = dto.PostalCode,
            OperatingHours = dto.OperatingHours,
            ServiceBays = dto.ServiceBays,
            IsMainBranch = dto.IsMainBranch
        };

        Branches.Add(branch);
        await SaveChangesAsync();
        _logger.LogInformation("Created branch {BranchId}", branch.Id);

        return branch.ToDto();
    }

    public async Task<BranchDto?> UpdateAsync(Guid id, UpdateBranchDto dto)
    {
        var branch = await Branches.FindAsync(id);
        if (branch == null) return null;

        branch.Name = dto.Name;
        branch.Code = dto.Code;
        branch.Email = dto.Email;
        branch.Phone = dto.Phone;
        branch.Address = dto.Address;
        branch.City = dto.City;
        branch.State = dto.State;
        branch.PostalCode = dto.PostalCode;
        branch.OperatingHours = dto.OperatingHours;
        branch.ServiceBays = dto.ServiceBays;
        branch.IsActive = dto.IsActive;
        branch.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return branch.ToDto();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var branch = await Branches.FindAsync(id);
        if (branch == null) return false;

        Branches.Remove(branch);
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetAsMainBranchAsync(Guid id)
    {
        var branch = await Branches.FindAsync(id);
        if (branch == null) return false;

        // Remove main branch flag from other branches
        var otherBranches = await Branches
            .Where(b => b.CompanyId == branch.CompanyId && b.Id != id && b.IsMainBranch)
            .ToListAsync();

        foreach (var other in otherBranches)
        {
            other.IsMainBranch = false;
        }

        branch.IsMainBranch = true;
        branch.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }
}

// Extension method for entity to DTO mapping
file static class BranchMappingExtensions
{
    public static BranchDto ToDto(this Branch branch) => new(
        Id: branch.Id,
        CompanyId: branch.CompanyId,
        Name: branch.Name,
        Code: branch.Code,
        Phone: branch.Phone,
        Email: branch.Email,
        Address: branch.Address,
        City: branch.City,
        State: branch.State,
        PostalCode: branch.PostalCode,
        OperatingHours: branch.OperatingHours,
        ServiceBays: branch.ServiceBays,
        IsMainBranch: branch.IsMainBranch,
        IsActive: branch.IsActive,
        CreatedAt: branch.CreatedAt
    );
}
