using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Auth.DTOs;
using Gixat.Web.Modules.Auth.Interfaces;

namespace Gixat.Web.Pages.Auth;

[AllowAnonymous]
public class LoginModel : PageModel
{
    private readonly IAuthService _authService;

    public LoginModel(IAuthService authService)
    {
        _authService = authService;
    }

    [BindProperty]
    public LoginDto Input { get; set; } = new();

    public string? ErrorMessage { get; set; }

    public string? ReturnUrl { get; set; }

    public void OnGet(string? returnUrl = null)
    {
        ReturnUrl = returnUrl ?? "/Dashboard";
    }

    public async Task<IActionResult> OnPostAsync(string? returnUrl = null)
    {
        returnUrl ??= "/Dashboard";

        if (!ModelState.IsValid)
        {
            return Page();
        }

        var (success, error) = await _authService.LoginAsync(Input);

        if (success)
        {
            return LocalRedirect(returnUrl);
        }

        ErrorMessage = error;
        return Page();
    }
}
