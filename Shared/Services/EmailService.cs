using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Gixat.Web.Shared.Interfaces;

namespace Gixat.Web.Shared.Services;

public class SmtpSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 465;
    public bool Secure { get; set; } = true;
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromName { get; set; } = "Gixat";
    public string FromEmail { get; set; } = string.Empty;
}

public class EmailService : IEmailService
{
    private readonly SmtpSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<SmtpSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string htmlBody, string? textBody = null)
    {
        return await SendEmailAsync(new EmailMessage
        {
            To = to,
            Subject = subject,
            HtmlBody = htmlBody,
            TextBody = textBody
        });
    }

    public async Task<bool> SendEmailAsync(string to, string toName, string subject, string htmlBody, string? textBody = null)
    {
        return await SendEmailAsync(new EmailMessage
        {
            To = to,
            ToName = toName,
            Subject = subject,
            HtmlBody = htmlBody,
            TextBody = textBody
        });
    }

    public async Task<bool> SendEmailAsync(EmailMessage message)
    {
        try
        {
            var email = new MimeMessage();
            
            // From
            email.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            
            // To
            if (!string.IsNullOrEmpty(message.ToName))
                email.To.Add(new MailboxAddress(message.ToName, message.To));
            else
                email.To.Add(MailboxAddress.Parse(message.To));
            
            // Reply-To
            if (!string.IsNullOrEmpty(message.ReplyTo))
                email.ReplyTo.Add(MailboxAddress.Parse(message.ReplyTo));
            
            // Subject
            email.Subject = message.Subject;
            
            // Body
            var builder = new BodyBuilder();
            builder.HtmlBody = message.HtmlBody;
            if (!string.IsNullOrEmpty(message.TextBody))
                builder.TextBody = message.TextBody;
            
            // Attachments
            if (message.Attachments != null)
            {
                foreach (var attachment in message.Attachments)
                {
                    builder.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
                }
            }
            
            email.Body = builder.ToMessageBody();
            
            // Send
            using var smtp = new SmtpClient();
            
            _logger.LogInformation("Connecting to SMTP server {Host}:{Port}", _settings.Host, _settings.Port);
            
            var secureSocketOptions = _settings.Secure ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            await smtp.ConnectAsync(_settings.Host, _settings.Port, secureSocketOptions);
            
            _logger.LogInformation("Authenticating with SMTP server");
            await smtp.AuthenticateAsync(_settings.User, _settings.Password);
            
            _logger.LogInformation("Sending email to {To}", message.To);
            await smtp.SendAsync(email);
            
            await smtp.DisconnectAsync(true);
            
            _logger.LogInformation("Email sent successfully to {To}", message.To);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}: {Message}", message.To, ex.Message);
            return false;
        }
    }

    public async Task<bool> SendTestEmailAsync(string to)
    {
        var htmlBody = @"
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { color: #22c55e; font-size: 48px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🚗 Gixat</h1>
            <p>Garage Management System</p>
        </div>
        <div class='content'>
            <p class='success' style='text-align: center;'>✓</p>
            <h2 style='text-align: center;'>Email Configuration Successful!</h2>
            <p>Congratulations! Your email service is configured correctly and working properly.</p>
            <p><strong>Server:</strong> " + _settings.Host + @"</p>
            <p><strong>Port:</strong> " + _settings.Port + @"</p>
            <p><strong>Secure:</strong> " + (_settings.Secure ? "SSL/TLS" : "STARTTLS") + @"</p>
            <p><strong>Sent at:</strong> " + DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC") + @"</p>
        </div>
        <div class='footer'>
            <p>This is an automated test email from Gixat.</p>
        </div>
    </div>
</body>
</html>";

        var textBody = $@"
Gixat - Email Configuration Test
================================

Email Configuration Successful!

Your email service is configured correctly and working properly.

Server: {_settings.Host}
Port: {_settings.Port}
Secure: {(_settings.Secure ? "SSL/TLS" : "STARTTLS")}
Sent at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss UTC}

This is an automated test email from Gixat.
";

        return await SendEmailAsync(to, "Gixat - Email Test Successful ✓", htmlBody, textBody);
    }
}
