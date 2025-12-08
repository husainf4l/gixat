using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Data;
using Gixat.Web.Modules.Clients.Entities;

namespace Gixat.Web.Pages.Clients
{
    public class EditModel : PageModel
    {
        private readonly AppDbContext _context;

        public EditModel(AppDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Client Client { get; set; } = default!;

        public string? ErrorMessage { get; set; }
        public string? SuccessMessage { get; set; }

        public async Task<IActionResult> OnGetAsync(Guid id)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == id);

            if (client == null)
            {
                return NotFound();
            }

            Client = client;
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please correct the errors below.";
                return Page();
            }

            var clientToUpdate = await _context.Clients.FindAsync(Client.Id);

            if (clientToUpdate == null)
            {
                return NotFound();
            }

            // Update properties
            clientToUpdate.FirstName = Client.FirstName;
            clientToUpdate.LastName = Client.LastName;
            clientToUpdate.Phone = Client.Phone;
            clientToUpdate.Email = Client.Email;
            clientToUpdate.Address = Client.Address;
            clientToUpdate.City = Client.City;
            clientToUpdate.State = Client.State;
            clientToUpdate.PostalCode = Client.PostalCode;
            clientToUpdate.Notes = Client.Notes;
            clientToUpdate.IsVip = Client.IsVip;
            clientToUpdate.IsActive = Client.IsActive;
            clientToUpdate.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                SuccessMessage = "Client updated successfully!";
                return RedirectToPage("/Clients/Details", new { id = Client.Id });
            }
            catch (DbUpdateException)
            {
                ErrorMessage = "An error occurred while saving. Please try again.";
                return Page();
            }
        }
    }
}
