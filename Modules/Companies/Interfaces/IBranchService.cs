using Gixat.Web.Modules.Companies.DTOs;

namespace Gixat.Web.Modules.Companies.Interfaces;

public interface IBranchService
{
    Task<BranchDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<BranchDto>> GetByCompanyIdAsync(Guid companyId);
    Task<BranchDto> CreateAsync(Guid companyId, CreateBranchDto dto);
    Task<BranchDto?> UpdateAsync(Guid id, UpdateBranchDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> SetAsMainBranchAsync(Guid id);
}
