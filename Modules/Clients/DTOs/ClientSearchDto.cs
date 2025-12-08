using System.Text.Json.Serialization;

namespace Gixat.Web.Modules.Clients.DTOs;

/// <summary>
/// Lightweight DTO for client autocomplete/search responses
/// </summary>
public class ClientSearchDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }
    
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;
    
    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [JsonPropertyName("isVip")]
    public bool IsVip { get; set; }
    
    [JsonPropertyName("vehicleCount")]
    public int VehicleCount { get; set; }
    
    [JsonPropertyName("lastVisitAt")]
    public DateTime? LastVisitAt { get; set; }
}
