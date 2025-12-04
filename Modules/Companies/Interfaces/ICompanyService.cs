using Gixat.Web.Modules.Companies.DTOs;
using Gixat.Web.Modules.Companies.Entities;

namespace Gixat.Web.Modules.Companies.Interfaces;

public interface ICompanyService
{
    Task<CompanyDto?> GetByIdAsync(Guid id);
    Task<CompanyDto?> GetByOwnerIdAsync(Guid ownerId);
    Task<IEnumerable<CompanyDto>> GetAllAsync();
    Task<CompanyDto> CreateAsync(CreateCompanyDto dto, Guid ownerId);
    Task<CompanyDto?> UpdateAsync(Guid id, UpdateCompanyDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ActivateAsync(Guid id);
    Task<bool> DeactivateAsync(Guid id);
    Task<bool> VerifyAsync(Guid id);
    
    // Entity-based methods
    Task<Company> CreateCompanyAsync(Company company);
    Task<Branch> CreateBranchAsync(Branch branch);
}
