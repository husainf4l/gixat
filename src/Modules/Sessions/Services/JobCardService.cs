using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Shared.Services;

namespace Gixat.Modules.Sessions.Services;

public class JobCardService : BaseService, IJobCardService
{
    private readonly ILogger<JobCardService> _logger;

    public JobCardService(DbContext context, ILogger<JobCardService> logger) : base(context)
    {
        _logger = logger;
    }

    private DbSet<JobCard> JobCards => Set<JobCard>();
    private DbSet<JobCardItem> JobCardItems => Set<JobCardItem>();
    private DbSet<GarageSession> GarageSessions => Set<GarageSession>();

    public async Task<JobCardDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var jobCard = await JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
            .Include(j => j.MediaItems)
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return jobCard?.ToDto();
    }

    public async Task<JobCardDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var jobCard = await JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
            .Include(j => j.MediaItems)
            .Where(j => j.SessionId == sessionId && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return jobCard?.ToDto();
    }

    public async Task<JobCardDto?> GetByJobCardNumberAsync(string jobCardNumber, Guid companyId)
    {
        var jobCard = await JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
            .Include(j => j.MediaItems)
            .Where(j => j.JobCardNumber == jobCardNumber && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return jobCard?.ToDto();
    }

    public async Task<IEnumerable<JobCardDto>> GetAllAsync(Guid companyId, JobCardStatus? status = null)
    {
        var query = JobCards
            .AsNoTracking()
            .Include(j => j.Items)
            .Where(j => j.CompanyId == companyId);

        if (status.HasValue)
            query = query.Where(j => j.Status == status.Value);

        var jobCards = await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
        return jobCards.Select(j => j.ToDto());
    }

    public async Task<JobCardDto> CreateAsync(CreateJobCardDto dto, Guid companyId)
    {
        _logger.LogInformation("Creating job card for session {SessionId}, company {CompanyId}", dto.SessionId, companyId);
        var jobCardNumber = await GenerateJobCardNumberAsync(companyId);

        var jobCard = new JobCard
        {
            SessionId = dto.SessionId,
            CompanyId = companyId,
            JobCardNumber = jobCardNumber,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            EstimatedStartAt = dto.EstimatedStartAt,
            EstimatedCompletionAt = dto.EstimatedCompletionAt,
            EstimatedHours = dto.EstimatedHours,
            SupervisorId = dto.SupervisorId,
            PrimaryTechnicianId = dto.PrimaryTechnicianId,
            Status = JobCardStatus.Draft
        };

        JobCards.Add(jobCard);
        await SaveChangesAsync();
        _logger.LogInformation("Created job card {JobCardNumber} with ID {JobCardId}", jobCardNumber, jobCard.Id);

        await UpdateSessionStatus(dto.SessionId, SessionStatus.AwaitingApproval);

        return jobCard.ToDto();
    }

    public async Task<JobCardDto?> UpdateAsync(Guid id, UpdateJobCardDto dto, Guid companyId)
    {
        var jobCard = await JobCards
            .Include(j => j.Items)
            .Include(j => j.MediaItems)
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return null;

        if (dto.Title != null) jobCard.Title = dto.Title;
        if (dto.Description != null) jobCard.Description = dto.Description;
        if (dto.Status.HasValue) jobCard.Status = dto.Status.Value;
        if (dto.Priority.HasValue) jobCard.Priority = dto.Priority.Value;
        if (dto.EstimatedStartAt.HasValue) jobCard.EstimatedStartAt = dto.EstimatedStartAt.Value;
        if (dto.EstimatedCompletionAt.HasValue) jobCard.EstimatedCompletionAt = dto.EstimatedCompletionAt.Value;
        if (dto.EstimatedHours.HasValue) jobCard.EstimatedHours = dto.EstimatedHours.Value;
        if (dto.SupervisorId.HasValue) jobCard.SupervisorId = dto.SupervisorId.Value;
        if (dto.PrimaryTechnicianId.HasValue) jobCard.PrimaryTechnicianId = dto.PrimaryTechnicianId.Value;
        if (dto.Notes != null) jobCard.Notes = dto.Notes;
        if (dto.InternalNotes != null) jobCard.InternalNotes = dto.InternalNotes;

        jobCard.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return jobCard.ToDto();
    }

    public async Task<bool> ApproveAsync(Guid id, Guid approvedById, string? notes, Guid companyId)
    {
        var jobCard = await JobCards.Where(j => j.Id == id && j.CompanyId == companyId).FirstOrDefaultAsync();
        if (jobCard == null) return false;

        jobCard.IsApproved = true;
        jobCard.ApprovedAt = DateTime.UtcNow;
        jobCard.ApprovedById = approvedById;
        jobCard.ApprovalNotes = notes;
        jobCard.Status = JobCardStatus.Approved;
        jobCard.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> AuthorizeAsync(Guid id, string method, string? notes, Guid companyId)
    {
        var jobCard = await JobCards.Where(j => j.Id == id && j.CompanyId == companyId).FirstOrDefaultAsync();
        if (jobCard == null) return false;

        jobCard.CustomerAuthorized = true;
        jobCard.CustomerAuthorizedAt = DateTime.UtcNow;
        jobCard.CustomerAuthorizationMethod = method;
        jobCard.CustomerAuthorizationNotes = notes;
        jobCard.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> StartWorkAsync(Guid id, Guid companyId)
    {
        var jobCard = await JobCards.Where(j => j.Id == id && j.CompanyId == companyId).FirstOrDefaultAsync();
        if (jobCard == null) return false;

        jobCard.Status = JobCardStatus.InProgress;
        jobCard.ActualStartAt = DateTime.UtcNow;
        jobCard.UpdatedAt = DateTime.UtcNow;

        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.InProgress);
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> CompleteWorkAsync(Guid id, Guid companyId)
    {
        var jobCard = await JobCards
            .Include(j => j.Items)
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();
        if (jobCard == null) return false;

        jobCard.Status = JobCardStatus.Completed;
        jobCard.ActualCompletionAt = DateTime.UtcNow;
        jobCard.ActualHours = jobCard.Items?.Sum(i => i.ActualHours) ?? 0;
        jobCard.UpdatedAt = DateTime.UtcNow;

        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.Completed);
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var jobCard = await JobCards.Where(j => j.Id == id && j.CompanyId == companyId).FirstOrDefaultAsync();
        if (jobCard == null) return false;

        JobCards.Remove(jobCard);
        await SaveChangesAsync();
        return true;
    }

    public async Task<string> GenerateJobCardNumberAsync(Guid companyId)
    {
        var today = DateTime.UtcNow;
        var prefix = $"JC-{today:yyyyMMdd}-";

        var lastJobCard = await JobCards
            .Where(j => j.CompanyId == companyId && j.JobCardNumber.StartsWith(prefix))
            .OrderByDescending(j => j.JobCardNumber)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastJobCard != null)
        {
            var lastNumberStr = lastJobCard.JobCardNumber.Replace(prefix, "");
            if (int.TryParse(lastNumberStr, out int lastNumber))
                nextNumber = lastNumber + 1;
        }

        return $"{prefix}{nextNumber:D4}";
    }

    #region Job Card Items

    public async Task<JobCardItemDto> AddItemAsync(CreateJobCardItemDto dto, Guid companyId)
    {
        var item = new JobCardItem
        {
            JobCardId = dto.JobCardId,
            CompanyId = companyId,
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            Priority = dto.Priority,
            EstimatedHours = dto.EstimatedHours,
            SortOrder = dto.SortOrder,
            Status = Enums.TaskStatus.Pending
        };

        JobCardItems.Add(item);
        await SaveChangesAsync();

        return item.ToDto();
    }

    public async Task<JobCardItemDto?> UpdateItemAsync(Guid itemId, UpdateJobCardItemDto dto, Guid companyId)
    {
        var item = await JobCardItems.Where(i => i.Id == itemId && i.CompanyId == companyId).FirstOrDefaultAsync();
        if (item == null) return null;

        if (dto.Title != null) item.Title = dto.Title;
        if (dto.Description != null) item.Description = dto.Description;
        if (dto.Category != null) item.Category = dto.Category;
        if (dto.Status.HasValue) item.Status = dto.Status.Value;
        if (dto.Priority.HasValue) item.Priority = dto.Priority.Value;
        if (dto.EstimatedHours.HasValue) item.EstimatedHours = dto.EstimatedHours.Value;
        if (dto.Notes != null) item.Notes = dto.Notes;

        item.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();

        return item.ToDto();
    }

    public async Task<bool> StartItemAsync(Guid itemId, Guid technicianId, Guid companyId)
    {
        var item = await JobCardItems.Where(i => i.Id == itemId && i.CompanyId == companyId).FirstOrDefaultAsync();
        if (item == null) return false;

        item.Status = Enums.TaskStatus.InProgress;
        item.TechnicianId = technicianId;
        item.StartedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> CompleteItemAsync(Guid itemId, string? workPerformed, string? technicianNotes, decimal? actualHours, Guid companyId)
    {
        var item = await JobCardItems.Where(i => i.Id == itemId && i.CompanyId == companyId).FirstOrDefaultAsync();
        if (item == null) return false;

        item.Status = Enums.TaskStatus.Completed;
        item.CompletedAt = DateTime.UtcNow;
        item.WorkPerformed = workPerformed;
        item.TechnicianNotes = technicianNotes;
        if (actualHours.HasValue) item.ActualHours = actualHours.Value;
        item.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> QualityCheckItemAsync(Guid itemId, Guid checkedById, string? notes, Guid companyId)
    {
        var item = await JobCardItems.Where(i => i.Id == itemId && i.CompanyId == companyId).FirstOrDefaultAsync();
        if (item == null) return false;

        item.QualityChecked = true;
        item.QualityCheckedAt = DateTime.UtcNow;
        item.QualityCheckedById = checkedById;
        item.QualityCheckNotes = notes;
        item.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveItemAsync(Guid itemId, Guid companyId)
    {
        var item = await JobCardItems.Where(i => i.Id == itemId && i.CompanyId == companyId).FirstOrDefaultAsync();
        if (item == null) return false;

        JobCardItems.Remove(item);
        await SaveChangesAsync();
        return true;
    }

    public async Task<JobCardItemDto> CreateItemFromCustomerRequestAsync(Guid jobCardId, Guid customerRequestId, string title, string? description, Guid companyId)
    {
        var item = new JobCardItem
        {
            JobCardId = jobCardId,
            CompanyId = companyId,
            Title = title,
            Description = description,
            Source = "CustomerRequest",
            SourceId = customerRequestId,
            Status = Enums.TaskStatus.Pending,
            Priority = Priority.Normal
        };

        JobCardItems.Add(item);
        await SaveChangesAsync();
        return item.ToDto();
    }

    public async Task<JobCardItemDto> CreateItemFromInspectionAsync(Guid jobCardId, Guid inspectionItemId, string title, string? description, Guid companyId)
    {
        var item = new JobCardItem
        {
            JobCardId = jobCardId,
            CompanyId = companyId,
            Title = title,
            Description = description,
            Source = "Inspection",
            SourceId = inspectionItemId,
            Status = Enums.TaskStatus.Pending,
            Priority = Priority.Normal
        };

        JobCardItems.Add(item);
        await SaveChangesAsync();
        return item.ToDto();
    }

    public async Task<JobCardItemDto> CreateItemFromTestDriveAsync(Guid jobCardId, Guid testDriveId, string title, string? description, Guid companyId)
    {
        var item = new JobCardItem
        {
            JobCardId = jobCardId,
            CompanyId = companyId,
            Title = title,
            Description = description,
            Source = "TestDrive",
            SourceId = testDriveId,
            Status = Enums.TaskStatus.Pending,
            Priority = Priority.Normal
        };

        JobCardItems.Add(item);
        await SaveChangesAsync();
        return item.ToDto();
    }

    #endregion

    private async Task UpdateSessionStatus(Guid sessionId, SessionStatus status)
    {
        var session = await GarageSessions.FindAsync(sessionId);
        if (session != null)
        {
            session.Status = status;
            session.UpdatedAt = DateTime.UtcNow;
            await SaveChangesAsync();
        }
    }
}

file static class JobCardMappingExtensions
{
    public static JobCardDto ToDto(this JobCard j) => new(
        Id: j.Id,
        SessionId: j.SessionId,
        JobCardNumber: j.JobCardNumber,
        Title: j.Title,
        Description: j.Description,
        Status: j.Status,
        Priority: j.Priority,
        EstimatedStartAt: j.EstimatedStartAt,
        EstimatedCompletionAt: j.EstimatedCompletionAt,
        ActualStartAt: j.ActualStartAt,
        ActualCompletionAt: j.ActualCompletionAt,
        EstimatedHours: j.EstimatedHours,
        ActualHours: j.ActualHours,
        SupervisorId: j.SupervisorId,
        PrimaryTechnicianId: j.PrimaryTechnicianId,
        IsApproved: j.IsApproved,
        ApprovedAt: j.ApprovedAt,
        CustomerAuthorized: j.CustomerAuthorized,
        CustomerAuthorizedAt: j.CustomerAuthorizedAt,
        CustomerAuthorizationMethod: j.CustomerAuthorizationMethod,
        WorkSummary: j.WorkSummary,
        TechnicianNotes: j.TechnicianNotes,
        Items: j.Items?.Select(i => i.ToDto()) ?? [],
        MediaItems: j.MediaItems?.Select(m => new MediaItemDto(
            Id: m.Id,
            FileName: m.FileName,
            OriginalFileName: m.OriginalFileName,
            ContentType: m.ContentType,
            FileSize: m.FileSize,
            S3Key: m.S3Key,
            S3Url: m.S3Url,
            MediaType: m.MediaType,
            Category: m.Category,
            Title: m.Title,
            Description: m.Description,
            ThumbnailS3Key: m.ThumbnailS3Key,
            SortOrder: m.SortOrder,
            CreatedAt: m.CreatedAt
        )) ?? [],
        CreatedAt: j.CreatedAt
    );

    public static JobCardItemDto ToDto(this JobCardItem i) => new(
        Id: i.Id,
        Title: i.Title,
        Description: i.Description,
        Category: i.Category,
        Status: i.Status,
        Priority: i.Priority,
        Source: i.Source,
        SourceId: i.SourceId,
        TechnicianId: i.TechnicianId,
        EstimatedHours: i.EstimatedHours,
        ActualHours: i.ActualHours,
        StartedAt: i.StartedAt,
        CompletedAt: i.CompletedAt,
        WorkPerformed: i.WorkPerformed,
        TechnicianNotes: i.TechnicianNotes,
        QualityChecked: i.QualityChecked,
        SortOrder: i.SortOrder,
        MediaItems: i.MediaItems?.Select(m => new MediaItemDto(
            Id: m.Id,
            FileName: m.FileName,
            OriginalFileName: m.OriginalFileName,
            ContentType: m.ContentType,
            FileSize: m.FileSize,
            S3Key: m.S3Key,
            S3Url: m.S3Url,
            MediaType: m.MediaType,
            Category: m.Category,
            Title: m.Title,
            Description: m.Description,
            ThumbnailS3Key: m.ThumbnailS3Key,
            SortOrder: m.SortOrder,
            CreatedAt: m.CreatedAt
        )) ?? []
    );
}
