namespace Gixat.Shared.Interfaces;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string htmlBody, string? textBody = null);
    Task<bool> SendEmailAsync(string to, string toName, string subject, string htmlBody, string? textBody = null);
    Task<bool> SendEmailAsync(EmailMessage message);
    Task<bool> SendTestEmailAsync(string to);
}

public class EmailMessage
{
    public string To { get; set; } = string.Empty;
    public string? ToName { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? TextBody { get; set; }
    public string? ReplyTo { get; set; }
    public List<EmailAttachment>? Attachments { get; set; }
}

public class EmailAttachment
{
    public string FileName { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "application/octet-stream";
}
