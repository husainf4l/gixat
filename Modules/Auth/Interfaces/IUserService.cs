using Gixat.Web.Modules.Auth.DTOs;
using Gixat.Web.Modules.Auth.Entities;

namespace Gixat.Web.Modules.Auth.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(Guid id);
    Task<UserDto?> GetByEmailAsync(string email);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<bool> UpdateAsync(Guid id, string firstName, string lastName);
    Task<bool> DeactivateAsync(Guid id);
    Task<bool> ActivateAsync(Guid id);
    Task<IEnumerable<string>> GetRolesAsync(Guid userId);
    Task<bool> AddToRoleAsync(Guid userId, string role);
    Task<bool> RemoveFromRoleAsync(Guid userId, string role);
}
