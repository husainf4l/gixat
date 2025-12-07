using Gixat.Web.Modules.Auth.DTOs;
using Gixat.Web.Modules.Auth.Entities;

namespace Gixat.Web.Modules.Auth.Interfaces;

public interface IAuthService
{
    Task<(bool Success, string[] Errors)> RegisterAsync(RegisterDto model);
    Task<(bool Success, string? Error)> LoginAsync(LoginDto model);
    Task LogoutAsync();
    Task<UserDto?> GetCurrentUserAsync();
    Task<bool> IsEmailConfirmedAsync(string email);
    Task<ApplicationUser?> GetUserByEmailAsync(string email);
}
