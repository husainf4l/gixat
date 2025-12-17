using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Entities;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Shared.Services;

namespace Gixat.Web.Modules.Sessions.Services;

public class JobCardService : BaseService, IJobCardService
{
    private readonly ILogger<JobCardService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IAwsS3Service _s3Service;

    public JobCardService(DbContext context, IAwsS3Service s3Service, ILogger<JobCardService> logger, IHttpContextAccessor httpContextAccessor) : base(context)
    {
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _s3Service = s3Service;
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

        if (jobCard == null) return null;

        // Regenerate presigned URLs for media items
        foreach (var media in jobCard.MediaItems ?? [])
        {
            media.S3Url = await _s3Service.GeneratePresignedDownloadUrlAsync(media.S3Key);
        }

        return jobCard.ToDto();
    }

    public async Task<JobCardDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var jobCard = await JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
            .Include(j => j.MediaItems)
            .Where(j => j.SessionId == sessionId && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return null;

        // Regenerate presigned URLs for media items
        foreach (var media in jobCard.MediaItems ?? [])
        {
            media.S3Url = await _s3Service.GeneratePresignedDownloadUrlAsync(media.S3Key);
        }

        return jobCard.ToDto();
    }

    public async Task<JobCardDto?> GetByJobCardNumberAsync(string jobCardNumber, Guid companyId)
    {
        var jobCard = await JobCards
            .AsNoTracking()
            .Include(j => j.Items.OrderBy(i => i.SortOrder))
            .Include(j => j.MediaItems)
            .Where(j => j.JobCardNumber == jobCardNumber && j.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (jobCard == null) return null;

        // Regenerate presigned URLs for media items
        foreach (var media in jobCard.MediaItems ?? [])
        {
            media.S3Url = await _s3Service.GeneratePresignedDownloadUrlAsync(media.S3Key);
        }

        return jobCard.ToDto();
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
            Status = JobCardStatus.Pending  // Changed from Draft to Pending - ready for approval
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
        _logger.LogInformation($"[ApproveAsync] START - JobCardId: {id}, CompanyId: {companyId}");
        
        var jobCard = await JobCards
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();
            
        if (jobCard == null)
        {
            _logger.LogWarning($"[ApproveAsync] JobCard not found - Id: {id}");
            return false;
        }

        _logger.LogInformation($"[ApproveAsync] BEFORE - Status: {jobCard.Status}, IsApproved: {jobCard.IsApproved}");
        
        // Update all fields
        jobCard.IsApproved = true;
        jobCard.ApprovedAt = DateTime.UtcNow;
        jobCard.ApprovedById = approvedById;
        jobCard.ApprovalNotes = notes;
        jobCard.Status = JobCardStatus.InProgress;
        jobCard.ActualStartAt = DateTime.UtcNow;
        jobCard.UpdatedAt = DateTime.UtcNow;

        // Explicitly mark as modified
        Context.Entry(jobCard).State = EntityState.Modified;

        _logger.LogInformation($"[ApproveAsync] AFTER CHANGES - Status: {jobCard.Status}, IsApproved: {jobCard.IsApproved}");
        
        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.InProgress);
        
        var changes = await Context.SaveChangesAsync();
        _logger.LogInformation($"[ApproveAsync] SaveChanges returned {changes} modified records");
        
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
        _logger.LogInformation($"[DEBUG] StartWorkAsync called - JobCardId: {id}, CompanyId: {companyId}");
        
        var jobCard = await JobCards
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();
            
        if (jobCard == null)
        {
            _logger.LogWarning($"[DEBUG] JobCard not found - Id: {id}, CompanyId: {companyId}");
            return false;
        }

        _logger.LogInformation($"[DEBUG] Current Status: {jobCard.Status}, Updating to InProgress");
        
        jobCard.Status = JobCardStatus.InProgress;
        jobCard.ActualStartAt = DateTime.UtcNow;
        jobCard.UpdatedAt = DateTime.UtcNow;
        
        Context.Entry(jobCard).State = EntityState.Modified;

        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.InProgress);
        var changes = await Context.SaveChangesAsync();
        
        _logger.LogInformation($"[DEBUG] JobCard started successfully - Id: {id}, Changes: {changes}");
        return true;
    }

    public async Task<bool> MoveToWaitingPartsAsync(Guid id, Guid companyId)
    {
        _logger.LogInformation($"[MoveToWaitingParts] JobCardId: {id}, CompanyId: {companyId}");
        
        var jobCard = await JobCards
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();
            
        if (jobCard == null)
        {
            _logger.LogWarning($"[MoveToWaitingParts] JobCard not found - Id: {id}");
            return false;
        }

        _logger.LogInformation($"[MoveToWaitingParts] Current Status: {jobCard.Status}, Moving to WaitingParts");
        
        jobCard.Status = JobCardStatus.WaitingParts;
        jobCard.UpdatedAt = DateTime.UtcNow;
        
        Context.Entry(jobCard).State = EntityState.Modified;

        var changes = await Context.SaveChangesAsync();
        
        _logger.LogInformation($"[MoveToWaitingParts] JobCard moved to WaitingParts - Id: {id}, Changes: {changes}");
        return true;
    }

    public async Task<bool> MoveToQualityCheckAsync(Guid id, Guid companyId)
    {
        _logger.LogInformation($"[MoveToQualityCheck] JobCardId: {id}, CompanyId: {companyId}");
        
        var jobCard = await JobCards
            .Include(j => j.Items)
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();
            
        if (jobCard == null)
        {
            _logger.LogWarning($"[MoveToQualityCheck] JobCard not found - Id: {id}");
            return false;
        }

        _logger.LogInformation($"[MoveToQualityCheck] Current Status: {jobCard.Status}, Moving to QualityCheck");
        
        jobCard.Status = JobCardStatus.QualityCheck;
        jobCard.ActualCompletionAt = DateTime.UtcNow;
        jobCard.ActualHours = jobCard.Items?.Sum(i => i.ActualHours) ?? 0;
        jobCard.UpdatedAt = DateTime.UtcNow;
        
        Context.Entry(jobCard).State = EntityState.Modified;

        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.QualityCheck);
        var changes = await Context.SaveChangesAsync();
        
        _logger.LogInformation($"[MoveToQualityCheck] JobCard moved to QualityCheck - Id: {id}, Changes: {changes}");
        return true;
    }

    public async Task<bool> CompleteWorkAsync(Guid id, Guid companyId)
    {
        _logger.LogInformation($"[CompleteWork] JobCardId: {id}, CompanyId: {companyId}");
        
        var jobCard = await JobCards
            .Include(j => j.Items)
            .Where(j => j.Id == id && j.CompanyId == companyId)
            .FirstOrDefaultAsync();
            
        if (jobCard == null)
        {
            _logger.LogWarning($"[CompleteWork] JobCard not found - Id: {id}");
            return false;
        }

        _logger.LogInformation($"[CompleteWork] Current Status: {jobCard.Status}, Moving to Completed");
        
        jobCard.Status = JobCardStatus.Completed;
        jobCard.ActualCompletionAt = DateTime.UtcNow;
        jobCard.ActualHours = jobCard.Items?.Sum(i => i.ActualHours) ?? 0;
        jobCard.UpdatedAt = DateTime.UtcNow;
        
        Context.Entry(jobCard).State = EntityState.Modified;

        await UpdateSessionStatus(jobCard.SessionId, SessionStatus.Completed);
        var changes = await Context.SaveChangesAsync();
        
        _logger.LogInformation($"[CompleteWork] JobCard completed - Id: {id}, Changes: {changes}");
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
        if (item == null)
        {
            _logger.LogWarning($"[QC ITEM] Item not found: {itemId}");
            return false;
        }

        // Validate: can only approve Completed items
        if (item.Status != Enums.TaskStatus.Completed)
        {
            _logger.LogWarning($"[QC ITEM] Cannot approve item {itemId} - status is {item.Status}, must be Completed");
            return false;
        }

        _logger.LogInformation($"[QC ITEM] Approving item {itemId} - Current QC: {item.QualityChecked}");

        item.QualityChecked = true;
        item.QualityCheckedAt = DateTime.UtcNow;
        item.QualityCheckedById = checkedById;
        item.QualityCheckNotes = notes;
        item.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        
        _logger.LogInformation($"[QC ITEM] Item {itemId} approved successfully - QC: {item.QualityChecked}");
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

    #region Comments

    public async Task<JobCardCommentDto> AddCommentAsync(CreateJobCardCommentDto dto, Guid companyId)
    {
        var jobCard = await JobCards.FindAsync(dto.JobCardId);
        if (jobCard == null || jobCard.CompanyId != companyId)
            throw new InvalidOperationException("Job card not found");

        var userId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userGuid = string.IsNullOrEmpty(userId) ? Guid.Empty : Guid.Parse(userId);
        var user = userGuid != Guid.Empty ? await Context.Set<Gixat.Web.Modules.Auth.Entities.ApplicationUser>().FindAsync(userGuid) : null;

        var comment = new JobCardComment
        {
            JobCardId = dto.JobCardId,
            CompanyId = companyId,
            AuthorId = user?.Id ?? Guid.Empty,
            AuthorName = user?.FullName ?? "System",
            Content = dto.Content,
            Type = dto.Type,
            MentionedUserIds = dto.MentionedUserIds,
            ParentCommentId = dto.ParentCommentId,
            AttachmentUrl = dto.AttachmentUrl,
            AttachmentName = dto.AttachmentName,
            HasAttachment = !string.IsNullOrWhiteSpace(dto.AttachmentUrl)
        };

        Set<JobCardComment>().Add(comment);
        await SaveChangesAsync();
        return comment.ToDto();
    }

    public async Task<IEnumerable<JobCardCommentDto>> GetCommentsAsync(Guid jobCardId, Guid companyId)
    {
        return await Set<JobCardComment>()
            .Where(c => c.JobCardId == jobCardId && c.CompanyId == companyId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => c.ToDto())
            .ToListAsync();
    }

    public async Task<bool> ResolveCommentAsync(Guid commentId, Guid resolvedById, Guid companyId)
    {
        var comment = await Set<JobCardComment>().FindAsync(commentId);
        if (comment == null || comment.CompanyId != companyId)
            return false;

        comment.IsResolved = true;
        comment.ResolvedAt = DateTime.UtcNow;
        comment.ResolvedById = resolvedById;
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCommentAsync(Guid commentId, Guid companyId)
    {
        var comment = await Set<JobCardComment>().FindAsync(commentId);
        if (comment == null || comment.CompanyId != companyId)
            return false;

        Set<JobCardComment>().Remove(comment);
        await SaveChangesAsync();
        return true;
    }

    #endregion

    #region Time Entries

    public async Task<JobCardTimeEntryDto> StartTimeEntryAsync(CreateJobCardTimeEntryDto dto, Guid companyId)
    {
        var jobCard = await JobCards.FindAsync(dto.JobCardId);
        if (jobCard == null || jobCard.CompanyId != companyId)
            throw new InvalidOperationException("Job card not found");

        var userId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userGuid = string.IsNullOrEmpty(userId) ? Guid.Empty : Guid.Parse(userId);
        var user = userGuid != Guid.Empty ? await Context.Set<Gixat.Web.Modules.Auth.Entities.ApplicationUser>().FindAsync(userGuid) : null;

        var timeEntry = new JobCardTimeEntry
        {
            JobCardId = dto.JobCardId,
            JobCardItemId = dto.JobCardItemId,
            CompanyId = companyId,
            TechnicianId = userGuid,
            TechnicianName = user?.FullName ?? "Unknown",
            StartTime = DateTime.UtcNow,
            IsActive = true,
            Description = dto.Description,
            IsBillable = dto.IsBillable,
            HourlyRate = dto.HourlyRate
        };

        Set<JobCardTimeEntry>().Add(timeEntry);
        await SaveChangesAsync();
        return timeEntry.ToDto();
    }

    public async Task<JobCardTimeEntryDto?> StopTimeEntryAsync(Guid timeEntryId, Guid companyId)
    {
        var timeEntry = await Set<JobCardTimeEntry>().FindAsync(timeEntryId);
        if (timeEntry == null || timeEntry.CompanyId != companyId)
            return null;

        if (!timeEntry.IsActive)
            return null;

        timeEntry.EndTime = DateTime.UtcNow;
        timeEntry.IsActive = false;
        timeEntry.Hours = (decimal)(timeEntry.EndTime.Value - timeEntry.StartTime).TotalHours - (timeEntry.BreakMinutes / 60m);
        timeEntry.TotalCost = timeEntry.Hours * timeEntry.HourlyRate;
        await SaveChangesAsync();
        return timeEntry.ToDto();
    }

    public async Task<IEnumerable<JobCardTimeEntryDto>> GetActiveTimeEntriesAsync(Guid jobCardId, Guid companyId)
    {
        return await Set<JobCardTimeEntry>()
            .Where(t => t.JobCardId == jobCardId && t.CompanyId == companyId && t.IsActive)
            .OrderBy(t => t.StartTime)
            .Select(t => t.ToDto())
            .ToListAsync();
    }

    public async Task<IEnumerable<JobCardTimeEntryDto>> GetTimeHistoryAsync(Guid jobCardId, Guid companyId)
    {
        return await Set<JobCardTimeEntry>()
            .Where(t => t.JobCardId == jobCardId && t.CompanyId == companyId)
            .OrderByDescending(t => t.StartTime)
            .Select(t => t.ToDto())
            .ToListAsync();
    }

    public async Task<decimal> GetTotalLaborCostAsync(Guid jobCardId, Guid companyId)
    {
        return await Set<JobCardTimeEntry>()
            .Where(t => t.JobCardId == jobCardId && t.CompanyId == companyId && t.IsBillable)
            .SumAsync(t => t.TotalCost);
    }

    #endregion

    #region Parts

    public async Task<JobCardPartDto> AddPartAsync(CreateJobCardPartDto dto, Guid companyId)
    {
        var jobCard = await JobCards.FindAsync(dto.JobCardId);
        if (jobCard == null || jobCard.CompanyId != companyId)
            throw new InvalidOperationException("Job card not found");

        var userId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userGuid = string.IsNullOrEmpty(userId) ? Guid.Empty : Guid.Parse(userId);
        var user = userGuid != Guid.Empty ? await Context.Set<Gixat.Web.Modules.Auth.Entities.ApplicationUser>().FindAsync(userGuid) : null;

        var part = new JobCardPart
        {
            JobCardId = dto.JobCardId,
            JobCardItemId = dto.JobCardItemId,
            CompanyId = companyId,
            InventoryItemId = dto.InventoryItemId,
            PartNumber = dto.PartNumber,
            PartName = dto.PartName,
            Description = dto.Description,
            QuantityUsed = dto.QuantityUsed,
            Unit = dto.Unit,
            UnitCost = dto.UnitCost,
            UnitPrice = dto.UnitPrice,
            Markup = dto.Markup,
            TotalCost = dto.QuantityUsed * dto.UnitCost,
            TotalPrice = dto.QuantityUsed * dto.UnitPrice,
            Source = dto.Source,
            Supplier = dto.Supplier,
            SupplierPartNumber = dto.SupplierPartNumber,
            Status = PartStatus.Pending,
            HasWarranty = dto.HasWarranty,
            WarrantyMonths = dto.WarrantyMonths,
            WarrantyInfo = dto.WarrantyInfo,
            Notes = dto.Notes,
            AddedById = user?.Id
        };

        Set<JobCardPart>().Add(part);
        await SaveChangesAsync();
        return part.ToDto();
    }

    public async Task<JobCardPartDto?> UpdatePartAsync(Guid partId, UpdateJobCardPartDto dto, Guid companyId)
    {
        var part = await Set<JobCardPart>().FindAsync(partId);
        if (part == null || part.CompanyId != companyId)
            return null;

        if (dto.QuantityUsed.HasValue) part.QuantityUsed = dto.QuantityUsed.Value;
        if (dto.UnitCost.HasValue) part.UnitCost = dto.UnitCost.Value;
        if (dto.UnitPrice.HasValue) part.UnitPrice = dto.UnitPrice.Value;
        if (dto.Markup.HasValue) part.Markup = dto.Markup.Value;
        if (dto.Source.HasValue) part.Source = dto.Source.Value;
        if (dto.Supplier != null) part.Supplier = dto.Supplier;
        if (dto.SupplierPartNumber != null) part.SupplierPartNumber = dto.SupplierPartNumber;
        if (dto.Status.HasValue) part.Status = dto.Status.Value;
        if (dto.HasWarranty.HasValue) part.HasWarranty = dto.HasWarranty.Value;
        if (dto.WarrantyMonths.HasValue) part.WarrantyMonths = dto.WarrantyMonths.Value;
        if (dto.WarrantyInfo != null) part.WarrantyInfo = dto.WarrantyInfo;
        if (dto.Notes != null) part.Notes = dto.Notes;

        part.TotalCost = part.QuantityUsed * part.UnitCost;
        part.TotalPrice = part.QuantityUsed * part.UnitPrice;
        await SaveChangesAsync();
        return part.ToDto();
    }

    public async Task<bool> UpdatePartStatusAsync(Guid partId, PartStatus status, Guid companyId)
    {
        var part = await Set<JobCardPart>().FindAsync(partId);
        if (part == null || part.CompanyId != companyId)
            return false;

        part.Status = status;
        
        if (status == PartStatus.Ordered)
            part.OrderedAt = DateTime.UtcNow;
        else if (status == PartStatus.Received)
            part.ReceivedAt = DateTime.UtcNow;
        else if (status == PartStatus.Installed)
            part.InstalledAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<JobCardPartDto>> GetPartsAsync(Guid jobCardId, Guid companyId)
    {
        return await Set<JobCardPart>()
            .Where(p => p.JobCardId == jobCardId && p.CompanyId == companyId)
            .OrderBy(p => p.CreatedAt)
            .Select(p => p.ToDto())
            .ToListAsync();
    }

    public async Task<decimal> GetTotalPartsCostAsync(Guid jobCardId, Guid companyId)
    {
        return await Set<JobCardPart>()
            .Where(p => p.JobCardId == jobCardId && p.CompanyId == companyId)
            .SumAsync(p => p.TotalPrice);
    }

    public async Task<bool> RemovePartAsync(Guid partId, Guid companyId)
    {
        var part = await Set<JobCardPart>().FindAsync(partId);
        if (part == null || part.CompanyId != companyId)
            return false;

        Set<JobCardPart>().Remove(part);
        await SaveChangesAsync();
        return true;
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
    
    public static JobCardCommentDto ToDto(this JobCardComment c) => new(
        Id: c.Id,
        JobCardId: c.JobCardId,
        AuthorId: c.AuthorId,
        AuthorName: c.AuthorName,
        Content: c.Content,
        Type: c.Type,
        MentionedUserIds: c.MentionedUserIds,
        HasAttachment: c.HasAttachment,
        AttachmentUrl: c.AttachmentUrl,
        AttachmentName: c.AttachmentName,
        IsResolved: c.IsResolved,
        ResolvedAt: c.ResolvedAt,
        ResolvedById: c.ResolvedById,
        ParentCommentId: c.ParentCommentId,
        Replies: c.Replies?.Select(r => r.ToDto()),
        CreatedAt: c.CreatedAt
    );

    public static JobCardTimeEntryDto ToDto(this JobCardTimeEntry t) => new(
        Id: t.Id,
        JobCardId: t.JobCardId,
        JobCardItemId: t.JobCardItemId,
        TechnicianId: t.TechnicianId,
        TechnicianName: t.TechnicianName,
        StartTime: t.StartTime,
        EndTime: t.EndTime,
        Hours: t.Hours,
        IsActive: t.IsActive,
        Description: t.Description,
        Notes: t.Notes,
        IsBillable: t.IsBillable,
        HourlyRate: t.HourlyRate,
        TotalCost: t.TotalCost,
        BreakMinutes: t.BreakMinutes,
        CreatedAt: t.CreatedAt
    );

    public static JobCardPartDto ToDto(this JobCardPart p) => new(
        Id: p.Id,
        JobCardId: p.JobCardId,
        JobCardItemId: p.JobCardItemId,
        InventoryItemId: p.InventoryItemId,
        PartNumber: p.PartNumber,
        PartName: p.PartName,
        Description: p.Description,
        QuantityUsed: p.QuantityUsed,
        Unit: p.Unit,
        UnitCost: p.UnitCost,
        UnitPrice: p.UnitPrice,
        Markup: p.Markup,
        TotalCost: p.TotalCost,
        TotalPrice: p.TotalPrice,
        Source: p.Source,
        Supplier: p.Supplier,
        SupplierPartNumber: p.SupplierPartNumber,
        Status: p.Status,
        OrderedAt: p.OrderedAt,
        ReceivedAt: p.ReceivedAt,
        InstalledAt: p.InstalledAt,
        HasWarranty: p.HasWarranty,
        WarrantyMonths: p.WarrantyMonths,
        WarrantyInfo: p.WarrantyInfo,
        Notes: p.Notes,
        AddedById: p.AddedById,
        CreatedAt: p.CreatedAt
    );
}
