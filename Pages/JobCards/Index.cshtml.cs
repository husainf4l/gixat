using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Claims;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Pages.JobCards;

[Authorize]
public class IndexModel : PageModel
{
    private readonly IJobCardService _jobCardService;

    public IndexModel(IJobCardService jobCardService)
    {
        _jobCardService = jobCardService;
    }

    public IEnumerable<JobCardDto> JobCards { get; set; } = [];
    public int TotalActive { get; set; }
    public int InProgress { get; set; }
    public int WaitingParts { get; set; }
    public int CompletedToday { get; set; }

    public async Task OnGetAsync()
    {
        var companyIdClaim = User.FindFirstValue("CompanyId");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            JobCards = [];
            return;
        }

        var companyId = Guid.Parse(companyIdClaim);
        
        JobCards = await _jobCardService.GetAllAsync(companyId);
        
        TotalActive = JobCards.Count(j => j.Status != JobCardStatus.Completed && j.Status != JobCardStatus.Cancelled);
        InProgress = JobCards.Count(j => j.Status == JobCardStatus.InProgress);
        WaitingParts = JobCards.Count(j => j.Status == JobCardStatus.WaitingParts);
        CompletedToday = JobCards.Count(j => j.Status == JobCardStatus.Completed && j.CreatedAt.Date == DateTime.UtcNow.Date);
    }
}
