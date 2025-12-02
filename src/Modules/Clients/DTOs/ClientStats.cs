namespace Gixat.Modules.Clients.DTOs;

public class ClientStats
{
    public int TotalClients { get; set; }
    public int VipClients { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageRevenue { get; set; }
}

public class PlatformStats
{
    public int TotalClients { get; set; }
    public int TotalCompanies { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageRevenuePerClient { get; set; }
}