using Gixat.Web.Data;
using Gixat.Web.Modules.Users.Entities;
using Gixat.Web.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gixat.Web.Pages.Settings;

[Authorize]
public class UsersModel : PageModel
{
    private readonly AppDbContext _context;
    private readonly ICompanyUserService _companyUserService;

    public UsersModel(AppDbContext context, ICompanyUserService companyUserService)
    {
        _context = context;
        _companyUserService = companyUserService;
    }

    public List<CompanyUser> Users { get; set; } = new();
    public List<UserInvitation> PendingInvitations { get; set; } = new();

    public async Task<IActionResult> OnGetAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();

        if (currentCompany == null)
        {
            return RedirectToPage("/Setup/Company");
        }

        var companyId = currentCompany.CompanyId;

        Users = await _context.CompanyUsers
            .Where(u => u.CompanyId == companyId)
            .OrderBy(u => u.FirstName)
            .ToListAsync();

        PendingInvitations = await _context.UserInvitations
            .Where(i => i.CompanyId == companyId && i.Status == InvitationStatus.Pending)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Page();
    }

    public async Task<IActionResult> OnPostInviteAsync(string Email, string? FirstName, string? LastName, int Role)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();

        if (currentCompany == null)
        {
            return RedirectToPage("/Setup/Company");
        }

        var companyId = currentCompany.CompanyId;
        var userGuid = Guid.Parse(userId);

        // Check if already invited
        var existing = await _context.UserInvitations
            .FirstOrDefaultAsync(i => i.CompanyId == companyId && 
                                      i.Email == Email && 
                                      i.Status == InvitationStatus.Pending);

        if (existing != null)
        {
            TempData["Error"] = "User already has a pending invitation";
            return RedirectToPage();
        }

        var invitation = new UserInvitation
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Email = Email,
            FirstName = FirstName,
            LastName = LastName,
            Role = (CompanyUserRole)Role,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            InvitedByUserId = userGuid,
            Status = InvitationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserInvitations.Add(invitation);
        await _context.SaveChangesAsync();

        TempData["Success"] = $"Invitation sent to {Email}";
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostDeactivateAsync(Guid UserId)
    {
        var user = await _context.CompanyUsers.FindAsync(UserId);
        if (user != null)
        {
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            TempData["Success"] = "User deactivated successfully";
        }
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostActivateAsync(Guid UserId)
    {
        var user = await _context.CompanyUsers.FindAsync(UserId);
        if (user != null)
        {
            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            TempData["Success"] = "User activated successfully";
        }
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostCancelInvitationAsync(Guid InvitationId)
    {
        var invitation = await _context.UserInvitations.FindAsync(InvitationId);
        if (invitation != null)
        {
            invitation.Status = InvitationStatus.Cancelled;
            invitation.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            TempData["Success"] = "Invitation cancelled";
        }
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostUpdateUserAsync(Guid UserId, string FirstName, string LastName, string Email, int Role, string? Department)
    {
        var user = await _context.CompanyUsers.FindAsync(UserId);
        if (user != null)
        {
            user.FirstName = FirstName;
            user.LastName = LastName;
            user.Email = Email;
            user.Role = (CompanyUserRole)Role;
            user.Department = Department;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            TempData["Success"] = "User updated successfully";
        }
        else
        {
            TempData["Error"] = "User not found";
        }
        return RedirectToPage();
    }
}
