using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Companies.DTOs;
using Gixat.Modules.Companies.Entities;
using Gixat.Modules.Companies.Interfaces;

namespace Gixat.Modules.Companies.Services;

public class BranchService : IBranchService
{
    private readonly DbContext _context;

    public BranchService(DbContext context)
    {
        _context = context;
    }

    private DbSet<Branch> Branches => _context.Set<Branch>();

    public async Task<BranchDto?> GetByIdAsync(Guid id)
    {
        var branch = await Branches.FindAsync(id);
        return branch == null ? null : MapToDto(branch);
    }

    public async Task<IEnumerable<BranchDto>> GetByCompanyIdAsync(Guid companyId)
    {
        var branches = await Branches
            .Where(b => b.CompanyId == companyId)
            .OrderBy(b => b.Name)
            .ToListAsync();
        return branches.Select(MapToDto);
    }

    public async Task<BranchDto> CreateAsync(Guid companyId, CreateBranchDto dto)
    {
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
        await _context.SaveChangesAsync();

        return MapToDto(branch);
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

        await _context.SaveChangesAsync();
        return MapToDto(branch);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var branch = await Branches.FindAsync(id);
        if (branch == null) return false;

        Branches.Remove(branch);
        await _context.SaveChangesAsync();
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

        await _context.SaveChangesAsync();
        return true;
    }

    private static BranchDto MapToDto(Branch branch)
    {
        return new BranchDto
        {
            Id = branch.Id,
            CompanyId = branch.CompanyId,
            Name = branch.Name,
            Code = branch.Code,
            Email = branch.Email,
            Phone = branch.Phone,
            Address = branch.Address,
            City = branch.City,
            State = branch.State,
            PostalCode = branch.PostalCode,
            OperatingHours = branch.OperatingHours,
            ServiceBays = branch.ServiceBays,
            IsMainBranch = branch.IsMainBranch,
            IsActive = branch.IsActive,
            CreatedAt = branch.CreatedAt
        };
    }
}
