using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Sessions.Data;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Gixat.Modules.Sessions.Services;

public class MediaService : IMediaService
{
    private readonly SessionDbContext _context;
    private readonly IAwsS3Service _s3Service;
    private readonly string _bucketName;

    public MediaService(SessionDbContext context, IAwsS3Service s3Service, IConfiguration configuration)
    {
        _context = context;
        _s3Service = s3Service;
        _bucketName = configuration["AWS:S3:BucketName"] ?? "gixat-media";
    }

    public async Task<MediaItemDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var media = await _context.MediaItems
            .AsNoTracking()
            .Where(m => m.Id == id && m.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return media == null ? null : MapToDto(media);
    }

    public async Task<IEnumerable<MediaItemDto>> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var media = await _context.MediaItems
            .AsNoTracking()
            .Where(m => m.SessionId == sessionId && m.CompanyId == companyId)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.SortOrder)
            .ToListAsync();

        return media.Select(MapToDto);
    }

    public async Task<IEnumerable<MediaItemDto>> GetByCategoryAsync(Guid sessionId, MediaCategory category, Guid companyId)
    {
        var media = await _context.MediaItems
            .AsNoTracking()
            .Where(m => m.SessionId == sessionId && m.Category == category && m.CompanyId == companyId)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        return media.Select(MapToDto);
    }

    public async Task<MediaUploadUrlDto> CreateUploadUrlAsync(CreateMediaItemDto dto, Guid companyId)
    {
        // Generate unique filename and S3 key
        var s3Key = _s3Service.GenerateS3Key(companyId, dto.SessionId, dto.Category, dto.OriginalFileName);
        var fileName = Path.GetFileName(s3Key);

        // Create media item record (pending upload)
        var mediaItem = new MediaItem
        {
            SessionId = dto.SessionId,
            CompanyId = companyId,
            FileName = fileName,
            OriginalFileName = dto.OriginalFileName,
            ContentType = dto.ContentType,
            FileSize = dto.FileSize,
            S3Key = s3Key,
            S3Bucket = _bucketName,
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

        _context.MediaItems.Add(mediaItem);
        await _context.SaveChangesAsync();

        // Generate presigned upload URL
        var uploadUrl = await _s3Service.GeneratePresignedUploadUrlAsync(s3Key, dto.ContentType);

        return new MediaUploadUrlDto(
            MediaItemId: mediaItem.Id,
            UploadUrl: uploadUrl,
            S3Key: s3Key,
            ExpiresAt: DateTime.UtcNow.AddMinutes(15)
        );
    }

    public async Task<MediaItemDto?> ConfirmUploadAsync(Guid mediaItemId, Guid companyId)
    {
        var mediaItem = await _context.MediaItems
            .Where(m => m.Id == mediaItemId && m.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (mediaItem == null) return null;

        // Verify file exists in S3
        var exists = await _s3Service.ObjectExistsAsync(mediaItem.S3Key);
        if (!exists)
        {
            // Remove the record if upload failed
            _context.MediaItems.Remove(mediaItem);
            await _context.SaveChangesAsync();
            return null;
        }

        // Generate permanent download URL (or you could generate on-demand)
        mediaItem.S3Url = await _s3Service.GeneratePresignedDownloadUrlAsync(mediaItem.S3Key, 60 * 24 * 7); // 7 days
        mediaItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(mediaItem);
    }

    public async Task<MediaDownloadUrlDto?> GetDownloadUrlAsync(Guid id, Guid companyId)
    {
        var mediaItem = await _context.MediaItems
            .AsNoTracking()
            .Where(m => m.Id == id && m.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (mediaItem == null) return null;

        var downloadUrl = await _s3Service.GeneratePresignedDownloadUrlAsync(mediaItem.S3Key);

        return new MediaDownloadUrlDto(
            MediaItemId: mediaItem.Id,
            DownloadUrl: downloadUrl,
            ExpiresAt: DateTime.UtcNow.AddMinutes(60)
        );
    }

    public async Task<MediaDownloadUrlDto?> GetThumbnailUrlAsync(Guid id, Guid companyId)
    {
        var mediaItem = await _context.MediaItems
            .AsNoTracking()
            .Where(m => m.Id == id && m.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (mediaItem == null || string.IsNullOrEmpty(mediaItem.ThumbnailS3Key)) return null;

        var downloadUrl = await _s3Service.GeneratePresignedDownloadUrlAsync(mediaItem.ThumbnailS3Key);

        return new MediaDownloadUrlDto(
            MediaItemId: mediaItem.Id,
            DownloadUrl: downloadUrl,
            ExpiresAt: DateTime.UtcNow.AddMinutes(60)
        );
    }

    public async Task<MediaItemDto?> UpdateAsync(Guid id, string? title, string? description, string? tags, int? sortOrder, Guid companyId)
    {
        var mediaItem = await _context.MediaItems
            .Where(m => m.Id == id && m.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (mediaItem == null) return null;

        if (title != null) mediaItem.Title = title;
        if (description != null) mediaItem.Description = description;
        if (tags != null) mediaItem.Tags = tags;
        if (sortOrder.HasValue) mediaItem.SortOrder = sortOrder.Value;

        mediaItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(mediaItem);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var mediaItem = await _context.MediaItems
            .Where(m => m.Id == id && m.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (mediaItem == null) return false;

        // Delete from S3
        await _s3Service.DeleteObjectAsync(mediaItem.S3Key);
        if (!string.IsNullOrEmpty(mediaItem.ThumbnailS3Key))
        {
            await _s3Service.DeleteObjectAsync(mediaItem.ThumbnailS3Key);
        }

        // Delete from database
        _context.MediaItems.Remove(mediaItem);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteBySessionAsync(Guid sessionId, Guid companyId)
    {
        var mediaItems = await _context.MediaItems
            .Where(m => m.SessionId == sessionId && m.CompanyId == companyId)
            .ToListAsync();

        foreach (var item in mediaItems)
        {
            await _s3Service.DeleteObjectAsync(item.S3Key);
            if (!string.IsNullOrEmpty(item.ThumbnailS3Key))
            {
                await _s3Service.DeleteObjectAsync(item.ThumbnailS3Key);
            }
        }

        _context.MediaItems.RemoveRange(mediaItems);
        await _context.SaveChangesAsync();

        return true;
    }

    private static MediaItemDto MapToDto(MediaItem media)
    {
        return new MediaItemDto(
            Id: media.Id,
            FileName: media.FileName,
            OriginalFileName: media.OriginalFileName,
            ContentType: media.ContentType,
            FileSize: media.FileSize,
            S3Key: media.S3Key,
            S3Url: media.S3Url,
            MediaType: media.MediaType,
            Category: media.Category,
            Title: media.Title,
            Description: media.Description,
            ThumbnailS3Key: media.ThumbnailS3Key,
            SortOrder: media.SortOrder,
            CreatedAt: media.CreatedAt
        );
    }
}
