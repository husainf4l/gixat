namespace Gixat.Web.Modules.Invoices.DTOs;

public class InvoiceStatsDto
{
    public decimal TodayRevenue { get; set; }
    public decimal WeekRevenue { get; set; }
    public decimal MonthRevenue { get; set; }
    public decimal OutstandingAmount { get; set; }
    public int OverdueInvoices { get; set; }
    public decimal OverdueAmount { get; set; }
    public decimal AverageInvoiceValue { get; set; }
    public int TotalInvoices { get; set; }
    public int PaidInvoices { get; set; }
}
