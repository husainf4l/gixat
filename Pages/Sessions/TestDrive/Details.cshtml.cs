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
public class DetailsModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly ITestDriveService _testDriveService;
    private readonly IMediaService _mediaService;
    private readonly ICompanyUserService _companyUserService;

    public DetailsModel(
        ISessionService sessionService,
        ITestDriveService testDriveService,
        IMediaService mediaService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _testDriveService = testDriveService;
        _mediaService = mediaService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public TestDriveDto TestDrive { get; set; } = default!;
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

        var testDrive = await _testDriveService.GetBySessionIdAsync(id, CompanyId);
        if (testDrive == null)
            return RedirectToPage("/Sessions/TestDrive/Create", new { id });

        TestDrive = testDrive;
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

        var testDrive = await _testDriveService.GetBySessionIdAsync(id, CompanyId);
        if (testDrive == null)
            return new JsonResult(new { success = false, error = "Test drive not found" });

        if (file == null || file.Length == 0)
            return new JsonResult(new { success = false, error = "No file provided" });

        var mediaType = file.ContentType.StartsWith("image/") ? MediaType.Image : MediaType.Video;

        var createDto = new CreateMediaItemDto(
            SessionId: id,
            OriginalFileName: file.FileName,
            ContentType: file.ContentType,
            FileSize: file.Length,
            MediaType: mediaType,
            Category: MediaCategory.TestDrive,
            TestDriveId: testDrive.Id
        );

        // Save file directly using the media service
        using var stream = file.OpenReadStream();
        var media = await _mediaService.UploadDirectAsync(createDto, stream, CompanyId);

        if (media == null)
            return new JsonResult(new { success = false, error = "Upload failed" });

        return new JsonResult(new { 
            success = true, 
            media = media
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

    public async Task<IActionResult> OnPostCompleteAsync(Guid id, int? mileageEnd)
    {
        Console.WriteLine($"[COMPLETE] OnPostCompleteAsync called - SessionId: {id}, MileageEnd: {mileageEnd}");
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine($"[COMPLETE] Not authenticated");
            return new JsonResult(new { success = false, error = "Not authenticated" });
        }

        var userCompanies = await _companyUserService.GetUserCompaniesAsync(Guid.Parse(userId));
        var currentCompany = userCompanies.FirstOrDefault();
        if (currentCompany == null)
        {
            Console.WriteLine($"[COMPLETE] No company found for user {userId}");
            return new JsonResult(new { success = false, error = "No company" });
        }

        CompanyId = currentCompany.CompanyId;
        Console.WriteLine($"[COMPLETE] CompanyId: {CompanyId}");

        var testDrive = await _testDriveService.GetBySessionIdAsync(id, CompanyId);
        if (testDrive == null)
        {
            Console.WriteLine($"[COMPLETE] Test drive not found for session {id}");
            return new JsonResult(new { success = false, error = "Test drive not found" });
        }

        Console.WriteLine($"[COMPLETE] Found TestDrive ID: {testDrive.Id}, Current Status: {testDrive.Status}");
        
        var result = await _testDriveService.CompleteTestDriveAsync(testDrive.Id, mileageEnd, CompanyId);
        Console.WriteLine($"[COMPLETE] CompleteTestDriveAsync result: {result}");
        
        if (!result)
            return new JsonResult(new { success = false, error = "Failed to complete test drive" });

        Console.WriteLine($"[COMPLETE] Test drive {testDrive.Id} completed successfully");
        return new JsonResult(new { success = true });
    }
}
