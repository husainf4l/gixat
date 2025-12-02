using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Gixat.Modules.Auth.Entities;

namespace Gixat.Modules.Auth.Pages;

public class ExternalLoginModel : PageModel
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<ExternalLoginModel> _logger;

    public ExternalLoginModel(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        ILogger<ExternalLoginModel> logger)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _logger = logger;
    }

    public string? ErrorMessage { get; set; }

    public string? ReturnUrl { get; set; }

    public IActionResult OnGet(string? returnUrl = null, string? remoteError = null)
    {
        // This is called when the user is redirected back from the external provider
        return RedirectToPage("./Login");
    }

    public IActionResult OnPost(string provider, string? returnUrl = null)
    {
        // Request a redirect to the external login provider
        var redirectUrl = Url.Page("./ExternalLogin", pageHandler: "Callback", values: new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        return new ChallengeResult(provider, properties);
    }

    public async Task<IActionResult> OnGetCallbackAsync(string? returnUrl = null, string? remoteError = null)
    {
        returnUrl ??= Url.Content("~/Dashboard");

        if (remoteError != null)
        {
            ErrorMessage = $"Error from external provider: {remoteError}";
            _logger.LogWarning("External login error: {Error}", remoteError);
            return Page();
        }

        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            ErrorMessage = "Error loading external login information.";
            _logger.LogWarning("Could not load external login info");
            return Page();
        }

        // Sign in the user with the external login provider if the user already has a login
        var result = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider, 
            info.ProviderKey, 
            isPersistent: true, 
            bypassTwoFactor: true);

        if (result.Succeeded)
        {
            _logger.LogInformation("{Name} logged in with {LoginProvider} provider.", 
                info.Principal.Identity?.Name, info.LoginProvider);
            
            // Update last login
            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (user != null)
            {
                user.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
            }
            
            return LocalRedirect(returnUrl);
        }

        if (result.IsLockedOut)
        {
            ErrorMessage = "Account is locked out.";
            return Page();
        }

        // If the user does not have an account, create one
        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            ErrorMessage = "Email claim not received from provider.";
            return Page();
        }

        // Check if user with this email already exists
        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            // Link the external login to the existing account
            var addLoginResult = await _userManager.AddLoginAsync(existingUser, info);
            if (addLoginResult.Succeeded)
            {
                await _signInManager.SignInAsync(existingUser, isPersistent: true);
                existingUser.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(existingUser);
                
                _logger.LogInformation("Linked {LoginProvider} to existing user {Email}.", 
                    info.LoginProvider, email);
                return LocalRedirect(returnUrl);
            }

            ErrorMessage = "Could not link external account to existing user.";
            return Page();
        }

        // Create a new user
        var firstName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? "";
        var lastName = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? "";
        var profilePicture = info.Principal.FindFirstValue("picture") ?? 
                            info.Principal.FindFirstValue("urn:google:picture");

        var newUser = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            ProfilePictureUrl = profilePicture,
            EmailConfirmed = true, // Email is confirmed by Google
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(newUser);
        if (createResult.Succeeded)
        {
            var addLoginResult = await _userManager.AddLoginAsync(newUser, info);
            if (addLoginResult.Succeeded)
            {
                // Assign default role
                await _userManager.AddToRoleAsync(newUser, "User");
                
                await _signInManager.SignInAsync(newUser, isPersistent: true);
                newUser.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(newUser);
                
                _logger.LogInformation("User created an account using {Name} provider with email {Email}.", 
                    info.LoginProvider, email);
                return LocalRedirect(returnUrl);
            }
        }

        foreach (var error in createResult.Errors)
        {
            _logger.LogError("Error creating user: {Error}", error.Description);
        }

        ErrorMessage = "Could not create account. Please try again.";
        return Page();
    }
}
