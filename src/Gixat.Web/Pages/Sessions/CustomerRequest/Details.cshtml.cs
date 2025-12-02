using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.CustomerRequest;

[Authorize]
public class DetailsModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly ICustomerRequestService _customerRequestService;
    private readonly IMediaService _mediaService;
    private readonly ICompanyUserService _companyUserService;

    public DetailsModel(
        ISessionService sessionService,
        ICustomerRequestService customerRequestService,
        IMediaService mediaService,
        ICompanyUserService companyUserService)
    {
        _sessionService = sessionService;
        _customerRequestService = customerRequestService;
        _mediaService = mediaService;
        _companyUserService = companyUserService;
    }

    public SessionDto Session { get; set; } = default!;
    public CustomerRequestDto CustomerRequest { get; set; } = default!;
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

        var customerRequest = await _customerRequestService.GetBySessionIdAsync(id, CompanyId);
        if (customerRequest == null)
            return RedirectToPage("/Sessions/CustomerRequest/Create", new { id });

        CustomerRequest = customerRequest;
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

        var customerRequest = await _customerRequestService.GetBySessionIdAsync(id, CompanyId);
        if (customerRequest == null)
            return new JsonResult(new { success = false, error = "Customer request not found" });

        if (file == null || file.Length == 0)
            return new JsonResult(new { success = false, error = "No file provided" });

        // Determine media type
        var mediaType = file.ContentType.StartsWith("image/") ? MediaType.Image : MediaType.Video;

        var createDto = new CreateMediaItemDto(
            SessionId: id,
            OriginalFileName: file.FileName,
            ContentType: file.ContentType,
            FileSize: file.Length,
            MediaType: mediaType,
            Category: MediaCategory.CustomerRequest,
            CustomerRequestId: customerRequest.Id
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
