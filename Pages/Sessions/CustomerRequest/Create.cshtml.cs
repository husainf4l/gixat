using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Users.Interfaces;

namespace Gixat.Web.Pages.Sessions.CustomerRequest;

[Authorize]
public class CreateModel : PageModel
{
    private readonly ISessionService _sessionService;
    private readonly ICustomerRequestService _customerRequestService;
    private readonly IMediaService _mediaService;
    private readonly ICompanyUserService _companyUserService;

    public CreateModel(
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
    
    public List<MediaItemDto> UploadedMedia { get; set; } = new();

    public SessionDto Session { get; set; } = default!;
    public Guid CompanyId { get; set; }

    [BindProperty]
    public CustomerRequestInput Input { get; set; } = new();
    
    [BindProperty]
    public string? MediaItemIds { get; set; } // Comma-separated list of media item IDs

    public class CustomerRequestInput
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CustomerConcerns { get; set; }
        public string? RequestedServices { get; set; }
        public Priority Priority { get; set; } = Priority.Normal;
        public string? Notes { get; set; }
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
        
        // Pre-fill title with vehicle info
        Input.Title = $"Service Request - {session.VehicleDisplayName}";
        
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

        var createDto = new CreateCustomerRequestDto(
            SessionId: id,
            Title: Input.Title,
            Description: Input.Description,
            CustomerConcerns: Input.CustomerConcerns,
            RequestedServices: Input.RequestedServices,
            Priority: Input.Priority,
            Notes: Input.Notes
        );

        var customerRequest = await _customerRequestService.CreateAsync(createDto, CompanyId);

        // Link uploaded media to the customer request
        if (!string.IsNullOrEmpty(MediaItemIds))
        {
            var mediaIds = MediaItemIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var mediaIdStr in mediaIds)
            {
                if (Guid.TryParse(mediaIdStr.Trim(), out var mediaId))
                {
                    await _mediaService.LinkToCustomerRequestAsync(mediaId, customerRequest.Id, CompanyId);
                }
            }
        }

        return RedirectToPage("/Sessions/Details", new { id });
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
            Category: MediaCategory.CustomerRequest,
            CustomerRequestId: null // Will be linked after customer request is created
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
