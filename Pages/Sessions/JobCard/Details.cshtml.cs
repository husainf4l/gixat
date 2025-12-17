using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.JobCard;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly IJobCardService _jobCardService;
    private readonly ICompanyUserService _companyUserService;
    private readonly ILogger<DetailsModel> _logger;

    public DetailsModel(
        ISessionService sessionService,
        IJobCardService jobCardService,
        ICompanyUserService companyUserService,
        ILogger<DetailsModel> logger)
    {
        _sessionService = sessionService;
        _jobCardService = jobCardService;
        _companyUserService = companyUserService;
        _logger = logger;
    }

    public SessionDto Session { get; set; } = default!;
    public JobCardDto JobCard { get; set; } = default!;
    public Guid CompanyId { get; set; }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCard Details] OnGetAsync - SessionId: {id} ============");
        
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
        CompanyId = currentCompany.CompanyId;

        // The id parameter is the SessionId (from route /Sessions/{id}/JobCard)
        var session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (session == null)
        {
            return NotFound();
        }
        Session = session;

        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            // No JobCard exists, redirect to create
            return RedirectToPage("/Sessions/JobCard/Create", new { id });
        }
        JobCard = jobCard;
        
        Console.WriteLine($"[JobCard] Loaded - JobCardId: {jobCard.Id}");
        Console.WriteLine($"[JobCard] Status: {jobCard.Status} (enum: {(int)jobCard.Status})");
        Console.WriteLine($"[JobCard] IsApproved: {jobCard.IsApproved}");
        Console.WriteLine($"[JobCard] Show Approve Button: {!jobCard.IsApproved}");
        Console.WriteLine($"[JobCard] Show Start Work Button: {jobCard.IsApproved && jobCard.Status != Gixat.Web.Modules.Sessions.Enums.JobCardStatus.InProgress && jobCard.Status != Gixat.Web.Modules.Sessions.Enums.JobCardStatus.Completed}");
        Console.WriteLine($"============================================================");

        return Page();
    }

    public async Task<IActionResult> OnPostStartWorkAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCard] START WORK CLICKED - SessionId: {id} ============");
        
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
        CompanyId = currentCompany.CompanyId;

        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            Console.WriteLine($"[JobCard StartWork] ERROR: JobCard not found!");
            return NotFound();
        }

        Console.WriteLine($"[JobCard StartWork] Found JobCardId: {jobCard.Id}, Status: {jobCard.Status}, IsApproved: {jobCard.IsApproved}");
        
        var result = await _jobCardService.StartWorkAsync(jobCard.Id, CompanyId);
        
        Console.WriteLine($"[JobCard StartWork] StartWorkAsync result: {result}");
        
        if (result)
        {
            TempData["SuccessMessage"] = "Work started successfully!";
        }
        else
        {
            TempData["ErrorMessage"] = "Failed to start work";
        }
        
        Console.WriteLine($"============================================================");

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostCompleteWorkAsync(Guid id)
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
        CompanyId = currentCompany.CompanyId;

        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            return NotFound();
        }

        await _jobCardService.CompleteWorkAsync(jobCard.Id, CompanyId);

        return RedirectToPage("/Sessions/Details", new { id });
    }

    public async Task<IActionResult> OnPostApproveAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCard] APPROVE CLICKED - SessionId: {id} ============");
        
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
        CompanyId = currentCompany.CompanyId;

        Console.WriteLine($"[JobCard Approve] CompanyId: {CompanyId}, SessionId: {id}");
        
        var jobCard = await _jobCardService.GetBySessionIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            Console.WriteLine($"[JobCard Approve] ERROR: JobCard not found!");
            TempData["ErrorMessage"] = "Job card not found";
            return NotFound();
        }

        Console.WriteLine($"[JobCard Approve] Found JobCardId: {jobCard.Id}, Current Status: {jobCard.Status}, IsApproved: {jobCard.IsApproved}");
        
        var result = await _jobCardService.ApproveAsync(jobCard.Id, Guid.Parse(userId), null, CompanyId);
        
        Console.WriteLine($"[JobCard Approve] Approve result: {result}");
        
        if (result)
        {
            TempData["SuccessMessage"] = "Job card approved successfully!";
        }
        else
        {
            TempData["ErrorMessage"] = "Failed to approve job card";
        }
        
        Console.WriteLine($"============================================================");

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostStartItemAsync(Guid id, Guid itemId)
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
        CompanyId = currentCompany.CompanyId;

        _logger.LogInformation($"[START ITEM] Session ID: {id}, Item ID: {itemId}");

        var updateDto = new UpdateJobCardItemDto(
            Title: null,
            Description: null,
            Category: null,
            Status: Gixat.Web.Modules.Sessions.Enums.TaskStatus.InProgress,
            Priority: null,
            TechnicianId: null,
            EstimatedHours: null,
            ActualHours: null,
            WorkPerformed: null,
            TechnicianNotes: null,
            Notes: null
        );

        var result = await _jobCardService.UpdateItemAsync(itemId, updateDto, CompanyId);
        
        _logger.LogInformation($"[START ITEM] Update result: {(result != null ? "Success" : "Failed")}");
        
        if (result != null)
        {
            TempData["SuccessMessage"] = "Work started successfully!";
        }

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostCompleteItemAsync(Guid id, Guid itemId)
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
        CompanyId = currentCompany.CompanyId;

        _logger.LogInformation($"[COMPLETE ITEM] Session ID: {id}, Item ID: {itemId}");

        var updateDto = new UpdateJobCardItemDto(
            Title: null,
            Description: null,
            Category: null,
            Status: Gixat.Web.Modules.Sessions.Enums.TaskStatus.Completed,
            Priority: null,
            TechnicianId: null,
            EstimatedHours: null,
            ActualHours: null,
            WorkPerformed: null,
            TechnicianNotes: null,
            Notes: null
        );

        var result = await _jobCardService.UpdateItemAsync(itemId, updateDto, CompanyId);
        
        _logger.LogInformation($"[COMPLETE ITEM] Update result: {(result != null ? "Success" : "Failed")}");
        
        if (result != null)
        {
            TempData["SuccessMessage"] = "Work completed successfully!";
        }

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostApproveItemAsync(Guid id, Guid itemId)
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
        CompanyId = currentCompany.CompanyId;

        _logger.LogInformation($"[WORK ITEM APPROVE] Session ID: {id}, Item ID: {itemId}, User: {userId}, Company: {CompanyId}");

        // Mark item as quality checked (approved)
        var result = await _jobCardService.QualityCheckItemAsync(itemId, Guid.Parse(userId), "Approved", CompanyId);
        
        _logger.LogInformation($"[WORK ITEM APPROVE] Quality check result: {result}");
        
        if (result)
        {
            TempData["SuccessMessage"] = "Work item approved successfully!";
        }
        else
        {
            TempData["ErrorMessage"] = "Failed to approve work item";
        }

        return RedirectToPage(new { id });
    }
}
