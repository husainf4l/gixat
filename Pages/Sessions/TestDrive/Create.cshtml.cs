using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.TestDrive;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly ITestDriveService _testDriveService;
    private readonly IMediaService _mediaService;
    private readonly ICompanyUserService _companyUserService;
    private readonly ILogger<CreateModel> _logger;

    public CreateModel(
        ISessionService sessionService,
        ITestDriveService testDriveService,
        IMediaService mediaService,
        ICompanyUserService companyUserService,
        ILogger<CreateModel> logger)
    {
        _sessionService = sessionService;
        _testDriveService = testDriveService;
        _mediaService = mediaService;
        _companyUserService = companyUserService;
        _logger = logger;
    }

    public SessionDto Session { get; set; } = default!;
    public Guid CompanyId { get; set; }

    [BindProperty]
    public TestDriveInput Input { get; set; } = new();

    public class TestDriveInput
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? MileageStart { get; set; }
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
        Input.Title = $"Test Drive - {session.VehicleDisplayName}";
        Input.MileageStart = session.MileageIn;
        
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

        var createDto = new CreateTestDriveDto(
            SessionId: id,
            Title: Input.Title,
            Description: Input.Description,
            MileageStart: Input.MileageStart,
            OverallPriority: Input.OverallPriority
        );

        var testDrive = await _testDriveService.CreateAsync(createDto, CompanyId);

        // Link any uploaded media items to the test drive
        if (!string.IsNullOrEmpty(Input.MediaItemIds))
        {
            var mediaIds = Input.MediaItemIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var mediaIdStr in mediaIds)
            {
                if (Guid.TryParse(mediaIdStr.Trim(), out var mediaId))
                {
                    await _mediaService.LinkToTestDriveAsync(mediaId, testDrive.Id, CompanyId);
                }
            }
        }

        return RedirectToPage("/Sessions/TestDrive/Details", new { id });
    }

    public async Task<IActionResult> OnPostUploadAsync(Guid id, IFormFile file)
    {
        try
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

            _logger.LogInformation("Starting direct upload for file: {FileName}", file.FileName);

            var mediaType = file.ContentType.StartsWith("image/") ? MediaType.Image : MediaType.Video;

            var createDto = new CreateMediaItemDto(
                SessionId: id,
                OriginalFileName: file.FileName,
                ContentType: file.ContentType,
                FileSize: file.Length,
                MediaType: mediaType,
                Category: MediaCategory.TestDrive,
                TestDriveId: null
            );

            // Upload directly through server to S3
            var result = await _mediaService.UploadDirectAsync(createDto, file.OpenReadStream(), CompanyId);
            
            if (result == null)
            {
                _logger.LogError("Direct upload returned null for file: {FileName}", file.FileName);
                return new JsonResult(new { success = false, error = "Upload failed - file could not be processed. Check server logs for details." });
            }

            _logger.LogInformation("File uploaded successfully: {MediaId}", result.Id);

            return new JsonResult(new { 
                success = true, 
                media = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during file upload for session {SessionId}, file {FileName}", id, file?.FileName ?? "unknown");
            return new JsonResult(new { success = false, error = $"Upload error: {ex.Message}" });
        }
    }

    public async Task<IActionResult> OnPostConfirmUploadAsync(Guid id, Guid mediaItemId)
    {
        try
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
                return new JsonResult(new { success = false, error = "Media item not found or upload confirmation failed" });

            return new JsonResult(new { success = true, media = result });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { success = false, error = $"Exception: {ex.Message}" });
        }
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
