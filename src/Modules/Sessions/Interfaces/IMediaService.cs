using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;

namespace Gixat.Modules.Sessions.Interfaces;

public interface IMediaService
{
    Task<MediaItemDto?> GetByIdAsync(Guid id, Guid companyId);
    Task<IEnumerable<MediaItemDto>> GetBySessionIdAsync(Guid sessionId, Guid companyId);
    Task<IEnumerable<MediaItemDto>> GetByCategoryAsync(Guid sessionId, MediaCategory category, Guid companyId);
    
    // Upload workflow
    Task<MediaUploadUrlDto> CreateUploadUrlAsync(CreateMediaItemDto dto, Guid companyId);
    Task<MediaItemDto?> ConfirmUploadAsync(Guid mediaItemId, Guid companyId);
    
    // Download
    Task<MediaDownloadUrlDto?> GetDownloadUrlAsync(Guid id, Guid companyId);
    Task<MediaDownloadUrlDto?> GetThumbnailUrlAsync(Guid id, Guid companyId);
    
    // Update
    Task<MediaItemDto?> UpdateAsync(Guid id, string? title, string? description, string? tags, int? sortOrder, Guid companyId);
    
    // Delete
    Task<bool> DeleteAsync(Guid id, Guid companyId);
    Task<bool> DeleteBySessionAsync(Guid sessionId, Guid companyId);
}

public interface IAwsS3Service
{
    Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType, int expirationMinutes = 15);
    Task<string> GeneratePresignedDownloadUrlAsync(string key, int expirationMinutes = 60);
    Task<bool> DeleteObjectAsync(string key);
    Task<bool> ObjectExistsAsync(string key);
    string GenerateS3Key(Guid companyId, Guid sessionId, MediaCategory category, string fileName);
}
