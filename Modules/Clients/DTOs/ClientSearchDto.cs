namespace Gixat.Web.Modules.Clients.DTOs;

/// <summary>
/// Lightweight DTO for client autocomplete/search responses
/// </summary>
public class ClientSearchDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool IsVip { get; set; }
    public int VehicleCount { get; set; }
    public DateTime? LastVisitAt { get; set; }
}
