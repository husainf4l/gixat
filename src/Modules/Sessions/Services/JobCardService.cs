using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Sessions.Data;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;
using TaskStatus = Gixat.Modules.Sessions.Enums.TaskStatus;

namespace Gixat.Modules.Sessions.Services;

public class JobCardService : IJobCardService
{
    private readonly SessionDbContext _context;

    public JobCardService(SessionDbContext context)
    {
        _context = context;
    }

    public async Task<JobCardDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
                .ThenInclude(i => i.MediaItems)
            .Include(j => j.MediaItems)
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return jobCard == null ? null : MapToDto(jobCard);
    }

    public async Task<JobCardDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
                .ThenInclude(i => i.MediaItems)
            .Include(j => j.MediaItems)
            .Where(j => j.SessionId == sessionId && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return jobCard == null ? null : MapToDto(jobCard);
    }

    public async Task<JobCardDto?> GetByJobCardNumberAsync(string jobCardNumber, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
            .Include(j => j.MediaItems)
            .Where(j => j.JobCardNumber == jobCardNumber && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return jobCard == null ? null : MapToDto(jobCard);
    }

    public async Task<IEnumerable<JobCardDto>> GetAllAsync(Guid companyId, JobCardStatus? status = null)
    {
        var query = _context.JobCards
            .AsNoTracking()
            .Include(j => j.Items)
            .Include(j => j.MediaItems)
            .Where(j => j.CompanyId == companyId);

        if (status.HasValue)
            query = query.Where(j => j.Status == status.Value);

        var jobCards = await query
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobCards.Select(MapToDto);
    }

    public async Task<JobCardDto> CreateAsync(CreateJobCardDto dto, Guid companyId)
    {
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

        _context.JobCards.Add(jobCard);
        await _context.SaveChangesAsync();

        return MapToDto(jobCard);
    }

    public async Task<JobCardDto?> UpdateAsync(Guid id, UpdateJobCardDto dto, Guid companyId)
    {
        var jobCard = await _context.JobCards
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
        if (dto.WorkSummary != null) jobCard.WorkSummary = dto.WorkSummary;
        if (dto.TechnicianNotes != null) jobCard.TechnicianNotes = dto.TechnicianNotes;
        if (dto.QualityNotes != null) jobCard.QualityNotes = dto.QualityNotes;
        if (dto.Notes != null) jobCard.Notes = dto.Notes;
        if (dto.InternalNotes != null) jobCard.InternalNotes = dto.InternalNotes;

        jobCard.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(jobCard);
    }

    public async Task<bool> ApproveAsync(Guid id, Guid approvedById, string? notes, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return false;

        jobCard.IsApproved = true;
        jobCard.ApprovedAt = DateTime.UtcNow;
        jobCard.ApprovedById = approvedById;
        jobCard.ApprovalNotes = notes;
        jobCard.Status = JobCardStatus.Approved;
        jobCard.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AuthorizeAsync(Guid id, string method, string? notes, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return false;

        jobCard.CustomerAuthorized = true;
        jobCard.CustomerAuthorizedAt = DateTime.UtcNow;
        jobCard.CustomerAuthorizationMethod = method;
        jobCard.CustomerAuthorizationNotes = notes;
        jobCard.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> StartWorkAsync(Guid id, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return false;

        jobCard.Status = JobCardStatus.InProgress;
        jobCard.ActualStartAt = DateTime.UtcNow;
        jobCard.UpdatedAt = DateTime.UtcNow;

        // Update session status
        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.InProgress);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CompleteWorkAsync(Guid id, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .Include(j => j.Items)
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return false;

        jobCard.Status = JobCardStatus.Completed;
        jobCard.ActualCompletionAt = DateTime.UtcNow;
        jobCard.ActualHours = jobCard.Items.Sum(i => i.ActualHours);
        jobCard.UpdatedAt = DateTime.UtcNow;

        // Update session status
        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.Completed);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var jobCard = await _context.JobCards
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return false;

        _context.JobCards.Remove(jobCard);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string> GenerateJobCardNumberAsync(Guid companyId)
    {
        var today = DateTime.UtcNow;
        var prefix = $"JOB-{today:yyyyMMdd}-";

        var lastJobCard = await _context.JobCards
            .Where(j => j.CompanyId == companyId && j.JobCardNumber.StartsWith(prefix))
            .OrderByDescending(j => j.JobCardNumber)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastJobCard != null)
        {
            var lastNumberStr = lastJobCard.JobCardNumber.Replace(prefix, "");
            if (int.TryParse(lastNumberStr, out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{prefix}{nextNumber:D4}";
    }

    // Job Card Items
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
            Source = dto.Source,
            SourceId = dto.SourceId,
            TechnicianId = dto.TechnicianId,
            EstimatedHours = dto.EstimatedHours,
            SortOrder = dto.SortOrder,
            Status = TaskStatus.Pending
        };

        _context.JobCardItems.Add(item);
        await _context.SaveChangesAsync();

        return MapItemToDto(item);
    }

    public async Task<JobCardItemDto?> UpdateItemAsync(Guid itemId, UpdateJobCardItemDto dto, Guid companyId)
    {
        var item = await _context.JobCardItems
            .Include(i => i.MediaItems)
            .Where(i => i.Id == itemId && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (item == null) return null;

        if (dto.Title != null) item.Title = dto.Title;
        if (dto.Description != null) item.Description = dto.Description;
        if (dto.Category != null) item.Category = dto.Category;
        if (dto.Status.HasValue) item.Status = dto.Status.Value;
        if (dto.Priority.HasValue) item.Priority = dto.Priority.Value;
        if (dto.TechnicianId.HasValue) item.TechnicianId = dto.TechnicianId.Value;
        if (dto.EstimatedHours.HasValue) item.EstimatedHours = dto.EstimatedHours.Value;
        if (dto.ActualHours.HasValue) item.ActualHours = dto.ActualHours.Value;
        if (dto.WorkPerformed != null) item.WorkPerformed = dto.WorkPerformed;
        if (dto.TechnicianNotes != null) item.TechnicianNotes = dto.TechnicianNotes;
        if (dto.Notes != null) item.Notes = dto.Notes;

        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapItemToDto(item);
    }

    public async Task<bool> StartItemAsync(Guid itemId, Guid technicianId, Guid companyId)
    {
        var item = await _context.JobCardItems
            .Where(i => i.Id == itemId && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (item == null) return false;

        item.Status = TaskStatus.InProgress;
        item.TechnicianId = technicianId;
        item.StartedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CompleteItemAsync(Guid itemId, string? workPerformed, string? technicianNotes, decimal? actualHours, Guid companyId)
    {
        var item = await _context.JobCardItems
            .Where(i => i.Id == itemId && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (item == null) return false;

        item.Status = TaskStatus.Completed;
        item.CompletedAt = DateTime.UtcNow;
        if (workPerformed != null) item.WorkPerformed = workPerformed;
        if (technicianNotes != null) item.TechnicianNotes = technicianNotes;
        if (actualHours.HasValue) item.ActualHours = actualHours.Value;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> QualityCheckItemAsync(Guid itemId, Guid checkedById, string? notes, Guid companyId)
    {
        var item = await _context.JobCardItems
            .Where(i => i.Id == itemId && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (item == null) return false;

        item.QualityChecked = true;
        item.QualityCheckedAt = DateTime.UtcNow;
        item.QualityCheckedById = checkedById;
        item.QualityCheckNotes = notes;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveItemAsync(Guid itemId, Guid companyId)
    {
        var item = await _context.JobCardItems
            .Where(i => i.Id == itemId && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (item == null) return false;

        _context.JobCardItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<JobCardItemDto> CreateItemFromCustomerRequestAsync(Guid jobCardId, Guid customerRequestId, string title, string? description, Guid companyId)
    {
        return await AddItemAsync(new CreateJobCardItemDto(
            JobCardId: jobCardId,
            Title: title,
            Description: description,
            Category: "Customer Request",
            Source: "CustomerRequest",
            SourceId: customerRequestId
        ), companyId);
    }

    public async Task<JobCardItemDto> CreateItemFromInspectionAsync(Guid jobCardId, Guid inspectionItemId, string title, string? description, Guid companyId)
    {
        return await AddItemAsync(new CreateJobCardItemDto(
            JobCardId: jobCardId,
            Title: title,
            Description: description,
            Category: "Inspection Finding",
            Source: "InspectionItem",
            SourceId: inspectionItemId
        ), companyId);
    }

    public async Task<JobCardItemDto> CreateItemFromTestDriveAsync(Guid jobCardId, Guid testDriveId, string title, string? description, Guid companyId)
    {
        return await AddItemAsync(new CreateJobCardItemDto(
            JobCardId: jobCardId,
            Title: title,
            Description: description,
            Category: "Test Drive Finding",
            Source: "TestDrive",
            SourceId: testDriveId
        ), companyId);
    }

    private async Task UpdateSessionStatus(Guid sessionId, SessionStatus status)
    {
        var session = await _context.GarageSessions.FindAsync(sessionId);
        if (session != null)
        {
            session.Status = status;
            session.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private static JobCardDto MapToDto(JobCard jobCard)
    {
        return new JobCardDto(
            Id: jobCard.Id,
            SessionId: jobCard.SessionId,
            JobCardNumber: jobCard.JobCardNumber,
            Title: jobCard.Title,
            Description: jobCard.Description,
            Status: jobCard.Status,
            Priority: jobCard.Priority,
            EstimatedStartAt: jobCard.EstimatedStartAt,
            EstimatedCompletionAt: jobCard.EstimatedCompletionAt,
            ActualStartAt: jobCard.ActualStartAt,
            ActualCompletionAt: jobCard.ActualCompletionAt,
            EstimatedHours: jobCard.EstimatedHours,
            ActualHours: jobCard.ActualHours,
            SupervisorId: jobCard.SupervisorId,
            PrimaryTechnicianId: jobCard.PrimaryTechnicianId,
            IsApproved: jobCard.IsApproved,
            ApprovedAt: jobCard.ApprovedAt,
            CustomerAuthorized: jobCard.CustomerAuthorized,
            CustomerAuthorizedAt: jobCard.CustomerAuthorizedAt,
            CustomerAuthorizationMethod: jobCard.CustomerAuthorizationMethod,
            WorkSummary: jobCard.WorkSummary,
            TechnicianNotes: jobCard.TechnicianNotes,
            Items: jobCard.Items?.Select(MapItemToDto) ?? Enumerable.Empty<JobCardItemDto>(),
            MediaItems: jobCard.MediaItems?.Select(m => new MediaItemDto(
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
            )) ?? Enumerable.Empty<MediaItemDto>(),
            CreatedAt: jobCard.CreatedAt
        );
    }

    private static JobCardItemDto MapItemToDto(JobCardItem item)
    {
        return new JobCardItemDto(
            Id: item.Id,
            Title: item.Title,
            Description: item.Description,
            Category: item.Category,
            Status: item.Status,
            Priority: item.Priority,
            Source: item.Source,
            SourceId: item.SourceId,
            TechnicianId: item.TechnicianId,
            EstimatedHours: item.EstimatedHours,
            ActualHours: item.ActualHours,
            StartedAt: item.StartedAt,
            CompletedAt: item.CompletedAt,
            WorkPerformed: item.WorkPerformed,
            TechnicianNotes: item.TechnicianNotes,
            QualityChecked: item.QualityChecked,
            SortOrder: item.SortOrder,
            MediaItems: item.MediaItems?.Select(m => new MediaItemDto(
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
            )) ?? Enumerable.Empty<MediaItemDto>()
        );
    }
}
