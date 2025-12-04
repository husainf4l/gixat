using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Companies.Entities;
using Gixat.Web.Modules.Companies.Interfaces;
using Gixat.Web.Modules.Users.Entities;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Setup;

[Authorize]
public class CompanyModel : PageModel
{
    private readonly ICompanyService _companyService;
    private readonly ICompanyUserService _userService;

    public CompanyModel(ICompanyService companyService, ICompanyUserService userService)
    {
        _companyService = companyService;
        _userService = userService;
    }

    [BindProperty]
    public InputModel Input { get; set; } = new();

    public string? ErrorMessage { get; set; }

    public class InputModel
    {
        // Basic Info
        [Required(ErrorMessage = "Garage name is required")]
        [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string? TradeName { get; set; }

        [Required(ErrorMessage = "Business email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        [StringLength(256)]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [StringLength(50)]
        public string? Phone { get; set; }

        // Location
        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(100)]
        public string? State { get; set; }

        [StringLength(20)]
        public string? PostalCode { get; set; }

        [StringLength(100)]
        public string? Country { get; set; }

        // Business Details
        [StringLength(50)]
        public string? TaxId { get; set; }

        [StringLength(100)]
        public string? RegistrationNumber { get; set; }

        [Required]
        [StringLength(10)]
        public string Currency { get; set; } = "USD";

        [StringLength(100)]
        public string? TimeZone { get; set; }

        [Url]
        [StringLength(256)]
        public string? Website { get; set; }

        // Main Branch
        [Required(ErrorMessage = "Branch name is required")]
        [StringLength(100)]
        public string BranchName { get; set; } = "Main Branch";

        [Range(1, 100)]
        public int? ServiceBays { get; set; }
    }

    public async Task<IActionResult> OnGetAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        // Check if user already has a company
        var userCompanies = await _userService.GetUserCompaniesAsync(Guid.Parse(userId));
        if (userCompanies.Any())
        {
            return RedirectToPage("/Dashboard");
        }

        // Pre-fill email from user
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (!string.IsNullOrEmpty(email))
        {
            Input.Email = email;
        }

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return RedirectToPage("/Auth/Login");
        }

        if (!ModelState.IsValid)
        {
            return Page();
        }

        try
        {
            var userGuid = Guid.Parse(userId);

            // Create company
            var company = new Company
            {
                Name = Input.Name,
                TradeName = Input.TradeName,
                Email = Input.Email,
                Phone = Input.Phone,
                Address = Input.Address,
                City = Input.City,
                State = Input.State,
                PostalCode = Input.PostalCode,
                Country = Input.Country,
                TaxId = Input.TaxId,
                RegistrationNumber = Input.RegistrationNumber,
                Currency = Input.Currency,
                TimeZone = Input.TimeZone,
                Website = Input.Website,
                OwnerId = userGuid,
                Plan = CompanyPlan.Free,
                IsActive = true,
                IsVerified = false
            };

            var createdCompany = await _companyService.CreateCompanyAsync(company);

            // Create main branch
            var branch = new Branch
            {
                CompanyId = createdCompany.Id,
                Name = Input.BranchName,
                IsMainBranch = true,
                IsActive = true,
                ServiceBays = Input.ServiceBays,
                Email = Input.Email,
                Phone = Input.Phone,
                Address = Input.Address,
                City = Input.City,
                State = Input.State,
                PostalCode = Input.PostalCode
            };

            await _companyService.CreateBranchAsync(branch);

            // Create company user (owner)
            var firstName = User.FindFirstValue(ClaimTypes.GivenName) ?? "Owner";
            var lastName = User.FindFirstValue(ClaimTypes.Surname) ?? "";
            var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? Input.Email;

            var companyUser = new CompanyUser
            {
                AuthUserId = userGuid,
                CompanyId = createdCompany.Id,
                FirstName = firstName,
                LastName = lastName,
                Email = userEmail,
                Role = CompanyUserRole.Owner,
                BranchId = branch.Id,
                IsActive = true,
                JoinedAt = DateTime.UtcNow
            };

            await _userService.CreateCompanyUserAsync(companyUser);

            return RedirectToPage("/Dashboard");
        }
        catch (Exception)
        {
            ErrorMessage = "An error occurred while creating your garage. Please try again.";
            // Log the exception
            return Page();
        }
    }
}
