using Gixat.Web.Modules.Users.Entities;

namespace Gixat.Web.Modules.Users.Interfaces;

public interface ICompanyUserService
{
    Task<CompanyUser?> GetByIdAsync(Guid id);
    Task<CompanyUser?> GetByAuthUserIdAndCompanyIdAsync(Guid authUserId, Guid companyId);
    Task<IEnumerable<CompanyUser>> GetByCompanyIdAsync(Guid companyId);
    Task<IEnumerable<CompanyUser>> GetUserCompaniesAsync(Guid authUserId);
    Task<CompanyUser> CreateCompanyUserAsync(CompanyUser companyUser);
    Task<CompanyUser?> UpdateAsync(CompanyUser companyUser);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> DeactivateAsync(Guid id);
    Task<bool> ActivateAsync(Guid id);
}
