using Gixat.Web.Data;
using Gixat.Web.Modules.Invoices.Entities;
using Gixat.Web.Modules.Invoices.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gixat.Web.Pages.Invoices;

[Authorize]
public class CreateModel : PageModel
{
    private readonly IInvoiceService _invoiceService;
    private readonly AppDbContext _context;

    public CreateModel(IInvoiceService invoiceService, AppDbContext context)
    {
        _invoiceService = invoiceService;
        _context = context;
    }

    [BindProperty]
    public InvoiceInput Input { get; set; } = new();

    public List<ClientOption> Clients { get; set; } = new();

    public async Task<IActionResult> OnGetAsync()
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            return RedirectToPage("/Auth/Login");
        }

        var companyId = Guid.Parse(companyIdClaim);

        // Load clients for dropdown
        Clients = await _context.Clients
            .Where(c => c.CompanyId == companyId)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .Select(c => new ClientOption
            {
                Id = c.Id,
                Name = c.FullName,
                Email = c.Email,
                Phone = c.Phone
            })
            .ToListAsync();

        // Initialize default values
        Input.InvoiceDate = DateTime.Today;
        Input.DueDate = DateTime.Today.AddDays(30);
        Input.TaxRate = 0.16m; // 16% VAT

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        var branchIdClaim = User.FindFirstValue("BranchId");
        
        if (string.IsNullOrEmpty(companyIdClaim) || string.IsNullOrEmpty(branchIdClaim))
        {
            return RedirectToPage("/Auth/Login");
        }

        var companyId = Guid.Parse(companyIdClaim);
        var branchId = Guid.Parse(branchIdClaim);

        if (!ModelState.IsValid)
        {
            // Reload clients for dropdown
            Clients = await _context.Clients
                .Where(c => c.CompanyId == companyId)
                .OrderBy(c => c.FirstName)
                .ThenBy(c => c.LastName)
                .Select(c => new ClientOption
                {
                    Id = c.Id,
                    Name = c.FullName,
                    Email = c.Email,
                    Phone = c.Phone
                })
                .ToListAsync();
            
            return Page();
        }

        // Get client details
        var client = await _context.Clients.FindAsync(Input.ClientId);
        if (client == null)
        {
            ModelState.AddModelError("", "Client not found");
            return Page();
        }

        // Calculate totals
        decimal subtotal = 0;
        decimal taxAmount = 0;
        var items = new List<InvoiceItem>();

        foreach (var itemInput in Input.Items)
        {
            var itemSubtotal = itemInput.Quantity * itemInput.UnitPrice;
            var itemTaxAmount = itemSubtotal * Input.TaxRate;
            var itemTotal = itemSubtotal + itemTaxAmount;

            items.Add(new InvoiceItem
            {
                Description = itemInput.Description,
                Quantity = itemInput.Quantity,
                UnitPrice = itemInput.UnitPrice,
                Subtotal = itemSubtotal,
                TaxRate = Input.TaxRate,
                TaxAmount = itemTaxAmount,
                Total = itemTotal,
                Type = itemInput.Type
            });

            subtotal += itemSubtotal;
            taxAmount += itemTaxAmount;
        }

        var total = subtotal + taxAmount - Input.DiscountAmount;

        var invoice = new Invoice
        {
            CompanyId = companyId,
            BranchId = branchId,
            InvoiceDate = Input.InvoiceDate,
            DueDate = Input.DueDate,
            ClientId = Input.ClientId,
            ClientName = client.FullName,
            ClientEmail = client.Email,
            ClientPhone = client.Phone,
            ClientAddress = client.Address,
            Subtotal = subtotal,
            TaxRate = Input.TaxRate,
            TaxAmount = taxAmount,
            DiscountAmount = Input.DiscountAmount,
            Total = total,
            Status = InvoiceStatus.Draft,
            Notes = Input.Notes,
            TermsAndConditions = Input.TermsAndConditions,
            Items = items
        };

        await _invoiceService.CreateInvoiceAsync(invoice);

        return RedirectToPage("/Invoices/Index");
    }
}

public class InvoiceInput
{
    public Guid ClientId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    public List<InvoiceItemInput> Items { get; set; } = new();
}

public class InvoiceItemInput
{
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public InvoiceItemType Type { get; set; }
}

public class ClientOption
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}
