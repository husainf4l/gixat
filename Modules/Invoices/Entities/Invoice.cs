using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Invoices.Entities;

public class Invoice : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    
    // Invoice Details
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    
    // Client
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientEmail { get; set; }
    public string? ClientPhone { get; set; }
    public string? ClientAddress { get; set; }
    
    // Vehicle (Optional)
    public Guid? ClientVehicleId { get; set; }
    public string? VehicleInfo { get; set; }
    
    // Session Reference
    public Guid? SessionId { get; set; }
    
    // Amounts
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; } = 0.16m; // 16% VAT
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Total { get; set; }
    
    // Payment
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public decimal PaidAmount { get; set; }
    public decimal BalanceDue { get; set; }
    
    // Dates
    public DateTime? PaidDate { get; set; }
    public DateTime? VoidedDate { get; set; }
    
    // Notes
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    
    // Navigation
    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public class InvoiceItem : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public Guid? InventoryItemId { get; set; }
    
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; } = 0.16m;
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    
    public InvoiceItemType Type { get; set; }
    
    // Navigation
    public Invoice? Invoice { get; set; }
}

public class Payment : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public Guid CompanyId { get; set; }
    
    public string PaymentNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    
    // Navigation
    public Invoice? Invoice { get; set; }
}

public enum InvoiceStatus
{
    Draft,
    Sent,
    Paid,
    PartiallyPaid,
    Overdue,
    Voided
}

public enum InvoiceItemType
{
    Service,
    Part,
    Labor,
    Tax,
    Discount
}

public enum PaymentMethod
{
    Cash,
    Card,
    BankTransfer,
    Check,
    MobilePayment,
    Other
}
