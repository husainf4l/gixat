using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Entities;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Shared.Services;

namespace Gixat.Web.Modules.Sessions.Services;

public class MediaService : BaseService, IMediaService
{
    private readonly IAwsS3Service _s3Service;
    private readonly ILogger<MediaService> _logger;

    public MediaService(DbContext context, IAwsS3Service s3Service, ILogger<MediaService> logger) : base(context)
    {
        _s3Service = s3Service;
        _logger = logger;
    }

    private DbSet<MediaItem> MediaItems => Set<MediaItem>();

    public async Task<MediaItemDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var media = await MediaItems
            .AsNoTracking()
            .Where(m => m.Id == id && m.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return media?.ToDto();
    }

    public async Task<IEnumerable<MediaItemDto>> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var items = await MediaItems
            .AsNoTracking()
            .Where(m => m.SessionId == sessionId && m.CompanyId == companyId)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.SortOrder)
            .ToListAsync();

        return items.Select(m => m.ToDto());
    }

    public async Task<IEnumerable<MediaItemDto>> GetByCategoryAsync(Guid sessionId, MediaCategory category, Guid companyId)
    {
        var items = await MediaItems
            .AsNoTracking()
            .Where(m => m.SessionId == sessionId && m.Category == category && m.CompanyId == companyId)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        return items.Select(m => m.ToDto());
    }

    public async Task<MediaUploadUrlDto> CreateUploadUrlAsync(CreateMediaItemDto dto, Guid companyId)
    {
        _logger.LogInformation("Creating upload URL for session {SessionId}, file {FileName}", dto.SessionId, dto.OriginalFileName);
        var s3Key = _s3Service.GenerateS3Key(companyId, dto.SessionId, dto.Category, dto.OriginalFileName);
        var uploadUrl = await _s3Service.GeneratePresignedUploadUrlAsync(s3Key, dto.ContentType);

        var media = new MediaItem
        {
            SessionId = dto.SessionId,
            CompanyId = companyId,
            FileName = System.IO.Path.GetFileName(s3Key),
            OriginalFileName = dto.OriginalFileName,
            ContentType = dto.ContentType,
            FileSize = dto.FileSize,
            S3Key = s3Key,
            S3Bucket = "gixat-media",
            MediaType = dto.MediaType,
            Category = dto.Category,
            CustomerRequestId = dto.CustomerRequestId,
            InspectionId = dto.InspectionId,
            TestDriveId = dto.TestDriveId,
            JobCardId = dto.JobCardId,
            JobCardItemId = dto.JobCardItemId,
            Title = dto.Title,
            Description = dto.Description,
            Tags = dto.Tags,
            SortOrder = dto.SortOrder
        };

        MediaItems.Add(media);
        await SaveChangesAsync();

        return new MediaUploadUrlDto(
            MediaItemId: media.Id,
            UploadUrl: uploadUrl,
            S3Key: s3Key,
            ExpiresAt: DateTime.UtcNow.AddMinutes(15)
        );
    }

    public async Task<MediaItemDto?> ConfirmUploadAsync(Guid mediaItemId, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == mediaItemId && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return null;

        var exists = await _s3Service.ObjectExistsAsync(media.S3Key);
        if (!exists) return null;

        media.S3Url = await _s3Service.GeneratePresignedDownloadUrlAsync(media.S3Key);
        media.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return media.ToDto();
    }

    public async Task<MediaDownloadUrlDto?> GetDownloadUrlAsync(Guid id, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == id && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return null;

        var downloadUrl = await _s3Service.GeneratePresignedDownloadUrlAsync(media.S3Key);

        return new MediaDownloadUrlDto(
            MediaItemId: media.Id,
            DownloadUrl: downloadUrl,
            ExpiresAt: DateTime.UtcNow.AddMinutes(60)
        );
    }

    public async Task<MediaDownloadUrlDto?> GetThumbnailUrlAsync(Guid id, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == id && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media?.ThumbnailS3Key == null) return null;

        var downloadUrl = await _s3Service.GeneratePresignedDownloadUrlAsync(media.ThumbnailS3Key);

        return new MediaDownloadUrlDto(
            MediaItemId: media.Id,
            DownloadUrl: downloadUrl,
            ExpiresAt: DateTime.UtcNow.AddMinutes(60)
        );
    }

    public async Task<MediaItemDto?> UpdateAsync(Guid id, string? title, string? description, string? tags, int? sortOrder, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == id && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return null;

        if (title != null) media.Title = title;
        if (description != null) media.Description = description;
        if (tags != null) media.Tags = tags;
        if (sortOrder.HasValue) media.SortOrder = sortOrder.Value;

        media.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return media.ToDto();
    }

    public async Task<bool> LinkToInspectionAsync(Guid mediaItemId, Guid inspectionId, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == mediaItemId && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return false;

        media.InspectionId = inspectionId;
        media.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> LinkToCustomerRequestAsync(Guid mediaItemId, Guid customerRequestId, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == mediaItemId && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return false;

        media.CustomerRequestId = customerRequestId;
        media.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> LinkToTestDriveAsync(Guid mediaItemId, Guid testDriveId, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == mediaItemId && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return false;

        media.TestDriveId = testDriveId;
        media.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> LinkToJobCardAsync(Guid mediaItemId, Guid jobCardId, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == mediaItemId && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return false;

        media.JobCardId = jobCardId;
        media.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var media = await MediaItems.Where(m => m.Id == id && m.CompanyId == companyId).FirstOrDefaultAsync();
        if (media == null) return false;

        await _s3Service.DeleteObjectAsync(media.S3Key);
        if (media.ThumbnailS3Key != null)
            await _s3Service.DeleteObjectAsync(media.ThumbnailS3Key);

        MediaItems.Remove(media);
        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteBySessionAsync(Guid sessionId, Guid companyId)
    {
        var items = await MediaItems.Where(m => m.SessionId == sessionId && m.CompanyId == companyId).ToListAsync();

        foreach (var media in items)
        {
            await _s3Service.DeleteObjectAsync(media.S3Key);
            if (media.ThumbnailS3Key != null)
                await _s3Service.DeleteObjectAsync(media.ThumbnailS3Key);
        }

        MediaItems.RemoveRange(items);
        await SaveChangesAsync();
        return true;
    }
}

file static class MediaMappingExtensions
{
    public static MediaItemDto ToDto(this MediaItem m) => new(
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
    );
}
