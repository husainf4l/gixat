using Gixat.Web.Modules.Invoices.Entities;

namespace Gixat.Web.Modules.Invoices.Interfaces;

public interface IInvoiceService
{
    Task<Invoice> CreateInvoiceAsync(Invoice invoice);
    Task<Invoice?> GetInvoiceByIdAsync(Guid id);
    Task<List<Invoice>> GetInvoicesByClientAsync(Guid clientId);
    Task<List<Invoice>> GetInvoicesByStatusAsync(Guid companyId, InvoiceStatus status);
    Task<List<Invoice>> GetOverdueInvoicesAsync(Guid companyId);
    Task<bool> UpdateInvoiceAsync(Invoice invoice);
    Task<bool> DeleteInvoiceAsync(Guid id);
    
    // Invoice Items
    Task<bool> AddInvoiceItemAsync(Guid invoiceId, InvoiceItem item);
    Task<bool> RemoveInvoiceItemAsync(Guid itemId);
    Task<bool> UpdateInvoiceItemAsync(InvoiceItem item);
    
    // Payments
    Task<Payment> AddPaymentAsync(Guid invoiceId, decimal amount, PaymentMethod method, string? reference = null);
    Task<List<Payment>> GetPaymentHistoryAsync(Guid invoiceId);
    
    // Status Management
    Task<bool> MarkAsSentAsync(Guid invoiceId);
    Task<bool> MarkAsPaidAsync(Guid invoiceId);
    Task<bool> VoidInvoiceAsync(Guid invoiceId);
    
    // Calculations
    Task RecalculateInvoiceAsync(Guid invoiceId);
}
