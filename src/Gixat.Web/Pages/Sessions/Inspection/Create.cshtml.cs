using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.Inspection;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly IInspectionService _inspectionService;
    private readonly IMediaService _mediaService;
    private readonly ICompanyUserService _companyUserService;

    public CreateModel(
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
    public Guid CompanyId { get; set; }
    
    // Store pending media item IDs to link after inspection creation
    [TempData]
    public string? PendingMediaIds { get; set; }

    [BindProperty]
    public InspectionInput Input { get; set; } = new();

    public class InspectionInput
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Priority OverallPriority { get; set; } = Priority.Normal;
        public string? MediaItemIds { get; set; }
    }

    public async Task<IActionResult> OnGetAsync(Guid id)
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

        var session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (session == null)
        {
            return NotFound();
        }

        Session = session;
        Input.Title = $"Vehicle Inspection - {session.VehicleDisplayName}";
        
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(Guid id)
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

        var session = await _sessionService.GetByIdAsync(id, CompanyId);
        if (session == null)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            Session = session;
            return Page();
        }

        var createDto = new CreateInspectionDto(
            SessionId: id,
            Title: Input.Title,
            Description: Input.Description,
            OverallPriority: Input.OverallPriority
        );

        var inspection = await _inspectionService.CreateAsync(createDto, CompanyId);

        // Link any uploaded media items to the inspection
        if (!string.IsNullOrEmpty(Input.MediaItemIds))
        {
            var mediaIds = Input.MediaItemIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var mediaIdStr in mediaIds)
            {
                if (Guid.TryParse(mediaIdStr.Trim(), out var mediaId))
                {
                    await _mediaService.LinkToInspectionAsync(mediaId, inspection.Id, CompanyId);
                }
            }
        }

        return RedirectToPage("/Sessions/Inspection/Details", new { id });
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
            InspectionId: null // Will be linked after inspection creation
        );

        var uploadUrl = await _mediaService.CreateUploadUrlAsync(createDto, CompanyId);

        return new JsonResult(new { 
            success = true, 
            mediaItemId = uploadUrl.MediaItemId,
            uploadUrl = uploadUrl.UploadUrl,
            s3Key = uploadUrl.S3Key
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
}
