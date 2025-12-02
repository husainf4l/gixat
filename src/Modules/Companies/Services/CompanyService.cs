using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Companies.DTOs;
using Gixat.Modules.Companies.Entities;
using Gixat.Modules.Companies.Interfaces;

namespace Gixat.Modules.Companies.Services;

public class CompanyService : ICompanyService
{
    private readonly DbContext _context;

    public CompanyService(DbContext context)
    {
        _context = context;
    }

    private DbSet<Company> Companies => _context.Set<Company>();
    private DbSet<Branch> Branches => _context.Set<Branch>();

    public async Task<CompanyDto?> GetByIdAsync(Guid id)
    {
        var company = await Companies.FindAsync(id);
        return company == null ? null : MapToDto(company);
    }

    public async Task<CompanyDto?> GetByOwnerIdAsync(Guid ownerId)
    {
        var company = await Companies
            .FirstOrDefaultAsync(c => c.OwnerId == ownerId);
        return company == null ? null : MapToDto(company);
    }

    public async Task<IEnumerable<CompanyDto>> GetAllAsync()
    {
        var companies = await Companies.ToListAsync();
        return companies.Select(MapToDto);
    }

    public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto, Guid ownerId)
    {
        var company = new Company
        {
            Name = dto.Name,
            TradeName = dto.TradeName,
            Email = dto.Email,
            Phone = dto.Phone,
            TaxId = dto.TaxId,
            RegistrationNumber = dto.RegistrationNumber,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            PostalCode = dto.PostalCode,
            Country = dto.Country,
            TimeZone = dto.TimeZone,
            Currency = dto.Currency,
            OwnerId = ownerId
        };

        Companies.Add(company);
        await _context.SaveChangesAsync();

        return MapToDto(company);
    }

    public async Task<CompanyDto?> UpdateAsync(Guid id, UpdateCompanyDto dto)
    {
        var company = await Companies.FindAsync(id);
        if (company == null) return null;

        company.Name = dto.Name;
        company.TradeName = dto.TradeName;
        company.Email = dto.Email;
        company.Phone = dto.Phone;
        company.Website = dto.Website;
        company.TaxId = dto.TaxId;
        company.RegistrationNumber = dto.RegistrationNumber;
        company.Address = dto.Address;
        company.City = dto.City;
        company.State = dto.State;
        company.PostalCode = dto.PostalCode;
        company.Country = dto.Country;
        company.TimeZone = dto.TimeZone;
        company.Currency = dto.Currency;
        company.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(company);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var company = await Companies.FindAsync(id);
        if (company == null) return false;

        Companies.Remove(company);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ActivateAsync(Guid id)
    {
        var company = await Companies.FindAsync(id);
        if (company == null) return false;

        company.IsActive = true;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateAsync(Guid id)
    {
        var company = await Companies.FindAsync(id);
        if (company == null) return false;

        company.IsActive = false;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VerifyAsync(Guid id)
    {
        var company = await Companies.FindAsync(id);
        if (company == null) return false;

        company.IsVerified = true;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Company> CreateCompanyAsync(Company company)
    {
        Companies.Add(company);
        await _context.SaveChangesAsync();
        return company;
    }

    public async Task<Branch> CreateBranchAsync(Branch branch)
    {
        Branches.Add(branch);
        await _context.SaveChangesAsync();
        return branch;
    }

    private static CompanyDto MapToDto(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            TradeName = company.TradeName,
            TaxId = company.TaxId,
            RegistrationNumber = company.RegistrationNumber,
            Email = company.Email,
            Phone = company.Phone,
            Website = company.Website,
            Address = company.Address,
            City = company.City,
            State = company.State,
            PostalCode = company.PostalCode,
            Country = company.Country,
            LogoUrl = company.LogoUrl,
            Plan = company.Plan.ToString(),
            PlanExpiresAt = company.PlanExpiresAt,
            TimeZone = company.TimeZone,
            Currency = company.Currency,
            IsActive = company.IsActive,
            IsVerified = company.IsVerified,
            OwnerId = company.OwnerId,
            CreatedAt = company.CreatedAt
        };
    }
}
