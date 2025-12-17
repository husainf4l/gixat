using Gixat.Web.Data;
using Gixat.Web.Modules.Invoices.Entities;
using Gixat.Web.Modules.Invoices.Interfaces;
using Gixat.Web.Modules.Invoices.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Gixat.Web.Modules.Invoices.Services;

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Invoice> CreateInvoiceAsync(Invoice invoice)
    {
        var count = await _context.Invoices.CountAsync();
        invoice.InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D4}";
        invoice.BalanceDue = invoice.Total;
        
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice?> GetInvoiceByIdAsync(Guid id)
    {
        return await _context.Invoices
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<List<Invoice>> GetInvoicesByClientAsync(Guid clientId)
    {
        return await _context.Invoices
            .Where(i => i.ClientId == clientId)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();
    }

    public async Task<List<Invoice>> GetInvoicesByStatusAsync(Guid companyId, InvoiceStatus status)
    {
        return await _context.Invoices
            .Where(i => i.CompanyId == companyId && i.Status == status)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();
    }

    public async Task<List<Invoice>> GetOverdueInvoicesAsync(Guid companyId)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Invoices
            .Where(i => i.CompanyId == companyId &&
                       i.DueDate < today &&
                       i.Status != InvoiceStatus.Paid &&
                       i.Status != InvoiceStatus.Voided)
            .OrderBy(i => i.DueDate)
            .ToListAsync();
    }

    public async Task<bool> UpdateInvoiceAsync(Invoice invoice)
    {
        _context.Invoices.Update(invoice);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteItemAsync(Guid id)
    {
        var invoice = await GetInvoiceByIdAsync(id);
        if (invoice == null) return false;

        _context.Invoices.Remove(invoice);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> AddInvoiceItemAsync(Guid invoiceId, InvoiceItem item)
    {
        item.InvoiceId = invoiceId;
        item.Subtotal = item.Quantity * item.UnitPrice;
        item.TaxAmount = item.Subtotal * item.TaxRate;
        item.Total = item.Subtotal + item.TaxAmount;

        _context.InvoiceItems.Add(item);
        await _context.SaveChangesAsync();

        await RecalculateInvoiceAsync(invoiceId);
        return true;
    }

    public async Task<bool> RemoveInvoiceItemAsync(Guid itemId)
    {
        var item = await _context.InvoiceItems.FindAsync(itemId);
        if (item == null) return false;

        var invoiceId = item.InvoiceId;
        _context.InvoiceItems.Remove(item);
        await _context.SaveChangesAsync();

        await RecalculateInvoiceAsync(invoiceId);
        return true;
    }

    public async Task<bool> UpdateInvoiceItemAsync(InvoiceItem item)
    {
        item.Subtotal = item.Quantity * item.UnitPrice;
        item.TaxAmount = item.Subtotal * item.TaxRate;
        item.Total = item.Subtotal + item.TaxAmount;

        _context.InvoiceItems.Update(item);
        await _context.SaveChangesAsync();

        await RecalculateInvoiceAsync(item.InvoiceId);
        return true;
    }

    public async Task<Payment> AddPaymentAsync(Guid invoiceId, decimal amount, PaymentMethod method, string? reference = null)
    {
        var invoice = await GetInvoiceByIdAsync(invoiceId);
        if (invoice == null) throw new Exception("Invoice not found");

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoiceId,
            CompanyId = invoice.CompanyId,
            Amount = amount,
            Method = method,
            Reference = reference,
            PaymentDate = DateTime.UtcNow,
            PaymentNumber = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{await _context.Payments.CountAsync() + 1:D4}"
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        await RecalculateInvoiceAsync(invoiceId);
        return payment;
    }

    public async Task<List<Payment>> GetPaymentHistoryAsync(Guid invoiceId)
    {
        return await _context.Payments
            .Where(p => p.InvoiceId == invoiceId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
    }

    public async Task<bool> MarkAsSentAsync(Guid invoiceId)
    {
        var invoice = await GetInvoiceByIdAsync(invoiceId);
        if (invoice == null) return false;

        invoice.Status = InvoiceStatus.Sent;
        return await UpdateInvoiceAsync(invoice);
    }

    public async Task<bool> MarkAsPaidAsync(Guid invoiceId)
    {
        var invoice = await GetInvoiceByIdAsync(invoiceId);
        if (invoice == null) return false;

        invoice.Status = InvoiceStatus.Paid;
        invoice.PaidDate = DateTime.UtcNow;
        return await UpdateInvoiceAsync(invoice);
    }

    public async Task<bool> VoidInvoiceAsync(Guid invoiceId)
    {
        var invoice = await GetInvoiceByIdAsync(invoiceId);
        if (invoice == null) return false;

        invoice.Status = InvoiceStatus.Voided;
        invoice.VoidedDate = DateTime.UtcNow;
        return await UpdateInvoiceAsync(invoice);
    }

    public async Task RecalculateInvoiceAsync(Guid invoiceId)
    {
        var invoice = await GetInvoiceByIdAsync(invoiceId);
        if (invoice == null) return;

        invoice.Subtotal = invoice.Items.Sum(i => i.Subtotal);
        invoice.TaxAmount = invoice.Items.Sum(i => i.TaxAmount);
        invoice.Total = invoice.Subtotal + invoice.TaxAmount - invoice.DiscountAmount;
        invoice.PaidAmount = invoice.Payments.Sum(p => p.Amount);
        invoice.BalanceDue = invoice.Total - invoice.PaidAmount;

        // Update status based on payment
        if (invoice.BalanceDue <= 0)
        {
            invoice.Status = InvoiceStatus.Paid;
            invoice.PaidDate = DateTime.UtcNow;
        }
        else if (invoice.PaidAmount > 0)
        {
            invoice.Status = InvoiceStatus.PartiallyPaid;
        }
        else if (invoice.DueDate < DateTime.UtcNow && invoice.Status == InvoiceStatus.Sent)
        {
            invoice.Status = InvoiceStatus.Overdue;
        }

        await UpdateInvoiceAsync(invoice);
    }

    public Task<bool> DeleteInvoiceAsync(Guid id)
    {
        return DeleteItemAsync(id);
    }

    public async Task<InvoiceStatsDto> GetInvoiceStatsAsync(Guid companyId)
    {
        var today = DateTime.UtcNow.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek);
        var monthStart = new DateTime(today.Year, today.Month, 1);

        var invoices = await _context.Invoices
            .Where(i => i.CompanyId == companyId)
            .ToListAsync();

        var stats = new InvoiceStatsDto
        {
            TodayRevenue = invoices
                .Where(i => i.InvoiceDate.Date == today && i.Status == InvoiceStatus.Paid)
                .Sum(i => i.Total),
            
            WeekRevenue = invoices
                .Where(i => i.InvoiceDate >= weekStart && i.Status == InvoiceStatus.Paid)
                .Sum(i => i.Total),
            
            MonthRevenue = invoices
                .Where(i => i.InvoiceDate >= monthStart && i.Status == InvoiceStatus.Paid)
                .Sum(i => i.Total),
            
            OutstandingAmount = invoices
                .Where(i => i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.PartiallyPaid || i.Status == InvoiceStatus.Overdue)
                .Sum(i => i.BalanceDue),
            
            OverdueInvoices = invoices.Count(i => i.Status == InvoiceStatus.Overdue),
            
            OverdueAmount = invoices
                .Where(i => i.Status == InvoiceStatus.Overdue)
                .Sum(i => i.BalanceDue),
            
            TotalInvoices = invoices.Count,
            
            PaidInvoices = invoices.Count(i => i.Status == InvoiceStatus.Paid),
            
            AverageInvoiceValue = invoices.Any() ? invoices.Average(i => i.Total) : 0
        };

        return stats;
    }
}
