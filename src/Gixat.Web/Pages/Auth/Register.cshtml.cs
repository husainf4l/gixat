using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Auth.DTOs;
using Gixat.Modules.Auth.Interfaces;

namespace Gixat.Web.Pages.Auth;

public class RegisterModel : PageModel
{
    private readonly IAuthService _authService;

    public RegisterModel(IAuthService authService)
    {
        _authService = authService;
    }

    [BindProperty]
    public RegisterDto Input { get; set; } = new();

    public string[] Errors { get; set; } = [];

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            return Page();
        }

        var (success, errors) = await _authService.RegisterAsync(Input);

        if (success)
        {
            // Auto-login after registration and redirect to Dashboard
            var loginDto = new LoginDto { Email = Input.Email, Password = Input.Password };
            await _authService.LoginAsync(loginDto);
            return Redirect("/Dashboard");
        }

        Errors = errors;
        return Page();
    }
}
