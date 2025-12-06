using Gixat.Web.Data;
using Gixat.Web.Modules.Invoices.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gixat.Web.Pages.Invoices;

[Authorize]
public class IndexModel : PageModel
{
    private readonly AppDbContext _context;

    public IndexModel(AppDbContext context)
    {
        _context = context;
    }

    public List<Invoice> AllInvoices { get; set; } = new();

    public async Task OnGetAsync()
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            AllInvoices = new();
            return;
        }

        var companyId = Guid.Parse(companyIdClaim);

        AllInvoices = await _context.Invoices
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .Where(i => i.CompanyId == companyId)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();
    }
}
