using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.JobCards;

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
        Console.WriteLine($"============ [JobCards] OnGetAsync - JobCardId: {id} ============");
        
        // Handle empty GUID - redirect to JobCards index
        if (id == Guid.Empty)
        {
            return RedirectToPage("/JobCards/Index");
        }

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

        // The id parameter is the JobCardId
        var jobCard = await _jobCardService.GetByIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            return NotFound();
        }
        JobCard = jobCard;

        // Get the session
        var session = await _sessionService.GetByIdAsync(jobCard.SessionId, CompanyId);
        if (session == null)
        {
            return NotFound();
        }
        Session = session;
        
        Console.WriteLine($"[JobCard] Status: {jobCard.Status} (enum: {(int)jobCard.Status})");
        Console.WriteLine($"[JobCard] IsApproved: {jobCard.IsApproved}");
        Console.WriteLine($"[JobCard] Show Approve Button: {!jobCard.IsApproved}");
        var showStartBtn = jobCard.IsApproved && jobCard.Status != Gixat.Web.Modules.Sessions.Enums.JobCardStatus.InProgress && jobCard.Status != Gixat.Web.Modules.Sessions.Enums.JobCardStatus.Completed;
        Console.WriteLine($"[JobCard] Show Start Work Button: {showStartBtn}");
        Console.WriteLine($"============================================================");

        return Page();
    }

    public async Task<IActionResult> OnPostStartWorkAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCards] START WORK CLICKED - JobCardId: {id} ============");
        
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

        Console.WriteLine($"[JobCards StartWork] Calling StartWorkAsync for JobCard: {id}");
        var result = await _jobCardService.StartWorkAsync(id, CompanyId);
        Console.WriteLine($"[JobCards StartWork] Result: {result}");
        Console.WriteLine($"============================================================");

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostNeedPartsAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCards] NEED PARTS CLICKED - JobCardId: {id} ============");
        
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

        Console.WriteLine($"[JobCards NeedParts] Calling MoveToWaitingPartsAsync for JobCard: {id}");
        var result = await _jobCardService.MoveToWaitingPartsAsync(id, CompanyId);
        Console.WriteLine($"[JobCards NeedParts] Result: {result}");
        Console.WriteLine($"============================================================");

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostQualityCheckAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCards] QUALITY CHECK CLICKED - JobCardId: {id} ============");
        
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

        Console.WriteLine($"[JobCards QualityCheck] Calling MoveToQualityCheckAsync for JobCard: {id}");
        var result = await _jobCardService.MoveToQualityCheckAsync(id, CompanyId);
        Console.WriteLine($"[JobCards QualityCheck] Result: {result}");
        Console.WriteLine($"============================================================");

        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostCompleteWorkAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCards] COMPLETE WORK CLICKED - JobCardId: {id} ============");
        
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

        var jobCard = await _jobCardService.GetByIdAsync(id, CompanyId);
        if (jobCard == null)
        {
            return NotFound();
        }

        Console.WriteLine($"[JobCards CompleteWork] Calling CompleteWorkAsync for JobCard: {id}");
        await _jobCardService.CompleteWorkAsync(id, CompanyId);
        Console.WriteLine($"[JobCards CompleteWork] Redirecting to Session Details");
        Console.WriteLine($"============================================================");

        return RedirectToPage("/Sessions/Details", new { id = jobCard.SessionId });
    }

    public async Task<IActionResult> OnPostApproveAsync(Guid id)
    {
        Console.WriteLine($"============ [JobCards] APPROVE CLICKED - JobCardId: {id} ============");
        
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

        Console.WriteLine($"[JobCards Approve] Calling ApproveAsync for JobCard: {id}, CompanyId: {CompanyId}");
        
        var result = await _jobCardService.ApproveAsync(id, Guid.Parse(userId), null, CompanyId);
        
        Console.WriteLine($"[JobCards Approve] Result: {result}");
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

        await _jobCardService.UpdateItemAsync(itemId, updateDto, CompanyId);

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

        await _jobCardService.UpdateItemAsync(itemId, updateDto, CompanyId);

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

        // Mark item as quality checked (approved)
        await _jobCardService.QualityCheckItemAsync(itemId, Guid.Parse(userId), "Approved", CompanyId);

        return RedirectToPage(new { id });
    }
}
