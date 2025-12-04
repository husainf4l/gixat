using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Shared.Interfaces;

namespace Gixat.Web.Pages.Admin;

[Authorize]
public class EmailTestModel : PageModel
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailTestModel> _logger;

    public EmailTestModel(IEmailService emailService, ILogger<EmailTestModel> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    [BindProperty]
    public string RecipientEmail { get; set; } = string.Empty;

    public string? Message { get; set; }
    public bool? Success { get; set; }

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (string.IsNullOrWhiteSpace(RecipientEmail))
        {
            Message = "Please enter a valid email address.";
            Success = false;
            return Page();
        }

        _logger.LogInformation("Sending test email to {Email}", RecipientEmail);
        
        var result = await _emailService.SendTestEmailAsync(RecipientEmail);
        
        if (result)
        {
            Message = $"Test email sent successfully to {RecipientEmail}!";
            Success = true;
        }
        else
        {
            Message = "Failed to send test email. Check the logs for details.";
            Success = false;
        }

        return Page();
    }
}
