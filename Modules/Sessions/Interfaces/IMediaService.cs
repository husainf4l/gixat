using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Modules.Sessions.Interfaces;

public interface IMediaService
{
    Task<MediaItemDto?> GetByIdAsync(Guid id, Guid companyId);
    Task<IEnumerable<MediaItemDto>> GetBySessionIdAsync(Guid sessionId, Guid companyId);
    Task<IEnumerable<MediaItemDto>> GetByCategoryAsync(Guid sessionId, MediaCategory category, Guid companyId);
    
    // Upload workflow
    Task<MediaUploadUrlDto> CreateUploadUrlAsync(CreateMediaItemDto dto, Guid companyId);
    Task<MediaItemDto?> ConfirmUploadAsync(Guid mediaItemId, Guid companyId);
    Task<MediaItemDto?> UploadDirectAsync(CreateMediaItemDto dto, Stream fileStream, Guid companyId);
    
    // Download
    Task<MediaDownloadUrlDto?> GetDownloadUrlAsync(Guid id, Guid companyId);
    Task<MediaDownloadUrlDto?> GetThumbnailUrlAsync(Guid id, Guid companyId);
    
    // Update
    Task<MediaItemDto?> UpdateAsync(Guid id, string? title, string? description, string? tags, int? sortOrder, Guid companyId);
    
    // Link media to entities (for deferred linking after creation)
    Task<bool> LinkToInspectionAsync(Guid mediaItemId, Guid inspectionId, Guid companyId);
    Task<bool> LinkToCustomerRequestAsync(Guid mediaItemId, Guid customerRequestId, Guid companyId);
    Task<bool> LinkToTestDriveAsync(Guid mediaItemId, Guid testDriveId, Guid companyId);
    Task<bool> LinkToJobCardAsync(Guid mediaItemId, Guid jobCardId, Guid companyId);
    
    // Delete
    Task<bool> DeleteAsync(Guid id, Guid companyId);
    Task<bool> DeleteBySessionAsync(Guid sessionId, Guid companyId);
}

public interface IAwsS3Service
{
    Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType, int expirationMinutes = 15);
    Task<string> GeneratePresignedDownloadUrlAsync(string key, int expirationMinutes = 60);
    Task<bool> UploadFileAsync(string key, Stream fileStream, string contentType);
    Task<bool> SaveFileLocallyAsync(string key, Stream fileStream);
    Task<bool> DeleteObjectAsync(string key);
    Task<bool> ObjectExistsAsync(string key);
    string GenerateS3Key(Guid companyId, Guid sessionId, MediaCategory category, string fileName);
}
