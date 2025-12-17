using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.Inspection;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly IInspectionService _inspectionService;
    private readonly IMediaService _mediaService;
    private readonly ICompanyUserService _companyUserService;

    public DetailsModel(
        ISessionService sessionService,
        IInspectionService inspectionService,
        IMediaService mediaService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _inspectionService = inspectionService;
        _mediaService = mediaService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public InspectionDto Inspection { get; set; } = default!;
    public Guid CompanyId { get; set; }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return RedirectToPage("/Auth/Login");

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
            return RedirectToPage("/Setup/Company");

        CompanyId = currentCompany.CompanyId;

        var session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (session == null)
            return NotFound();

        Session = session;

        var inspection = await _inspectionService.GetBySessionIdAsync(id, CompanyId);
        if (inspection == null)
            return RedirectToPage("/Sessions/Inspection/Create", new { id });

        Inspection = inspection;
        return Page();
    }

    public async Task<IActionResult> OnPostUploadAsync(Guid id, IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return new JsonResult(new { success = false, error = "Not authenticated" });

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
            return new JsonResult(new { success = false, error = "No company" });

        CompanyId = currentCompany.CompanyId;

        var inspection = await _inspectionService.GetBySessionIdAsync(id, CompanyId);
        if (inspection == null)
            return new JsonResult(new { success = false, error = "Inspection not found" });

        if (file == null || file.Length == 0)
            return new JsonResult(new { success = false, error = "No file provided" });

        var mediaType = file.ContentType.StartsWith("image/") ? MediaType.Image : MediaType.Video;

        var createDto = new CreateMediaItemDto(
            SessionId: id,
            OriginalFileName: file.FileName,
            ContentType: file.ContentType,
            FileSize: file.Length,
            MediaType: mediaType,
            Category: MediaCategory.Inspection,
            InspectionId: inspection.Id
        );

        // Use direct upload instead of presigned URL
        using var stream = file.OpenReadStream();
        var result = await _mediaService.UploadDirectAsync(createDto, stream, CompanyId);

        if (result == null)
            return new JsonResult(new { success = false, error = "Upload failed" });

        return new JsonResult(new { 
            success = true, 
            media = result
        });
    }

    public async Task<IActionResult> OnPostConfirmUploadAsync(Guid id, Guid mediaItemId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return new JsonResult(new { success = false, error = "Not authenticated" });

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
            return new JsonResult(new { success = false, error = "No company" });

        CompanyId = currentCompany.CompanyId;

        var result = await _mediaService.ConfirmUploadAsync(mediaItemId, CompanyId);
        if (result == null)
            return new JsonResult(new { success = false, error = "Upload confirmation failed" });

        return new JsonResult(new { success = true, media = result });
    }

    public async Task<IActionResult> OnPostDeleteMediaAsync(Guid id, Guid mediaId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return new JsonResult(new { success = false, error = "Not authenticated" });

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
            return new JsonResult(new { success = false, error = "No company" });

        CompanyId = currentCompany.CompanyId;

        var result = await _mediaService.DeleteAsync(mediaId, CompanyId);
        return new JsonResult(new { success = result });
    }

    public async Task<IActionResult> OnPostStartInspectionAsync(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return RedirectToPage("/Auth/Login");

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
            return RedirectToPage("/Setup/Company");

        CompanyId = currentCompany.CompanyId;

        var inspection = await _inspectionService.GetBySessionIdAsync(id, CompanyId);
        if (inspection == null)
            return NotFound();

        await _inspectionService.StartInspectionAsync(inspection.Id, Guid.Parse(userId), CompanyId);
        
        TempData["SuccessMessage"] = "Inspection started successfully";
        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostCompleteInspectionAsync(Guid id)
    {
        Console.WriteLine($"[DEBUG] OnPostCompleteInspectionAsync called - SessionId: {id}");
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return RedirectToPage("/Auth/Login");

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
            return RedirectToPage("/Setup/Company");

        CompanyId = currentCompany.CompanyId;

        var inspection = await _inspectionService.GetBySessionIdAsync(id, CompanyId);
        if (inspection == null)
        {
            Console.WriteLine($"[DEBUG] Inspection not found for session {id}");
            return NotFound();
        }

        Console.WriteLine($"[DEBUG] Found inspection {inspection.Id}, Status: {inspection.Status}");
        
        var result = await _inspectionService.CompleteInspectionAsync(inspection.Id, CompanyId);
        
        Console.WriteLine($"[DEBUG] CompleteInspectionAsync result: {result}");
        
        TempData["SuccessMessage"] = "Inspection completed successfully";
        return RedirectToPage(new { id });
    }
}
