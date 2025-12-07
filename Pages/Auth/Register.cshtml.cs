using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Identity;
using Gixat.Web.Modules.Auth.DTOs;
using Gixat.Web.Modules.Auth.Interfaces;
using Gixat.Web.Modules.Auth.Entities;

namespace Gixat.Web.Pages.Auth;

public class RegisterModel : PageModel
{
    private readonly IAuthService _authService;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public RegisterModel(IAuthService authService, SignInManager<ApplicationUser> signInManager)
    {
        _authService = authService;
        _signInManager = signInManager;
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
            // Find the newly created user and sign them in directly
            var user = await _authService.GetUserByEmailAsync(Input.Email);
            if (user != null)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);
            }
            return Redirect("/Dashboard");
        }

        Errors = errors;
        return Page();
    }
}
