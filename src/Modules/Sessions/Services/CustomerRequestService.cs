using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;

namespace Gixat.Modules.Sessions.Services;

public class CustomerRequestService : ICustomerRequestService
{
    private readonly DbContext _context;

    public CustomerRequestService(DbContext context)
    {
        _context = context;
    }

    private DbSet<CustomerRequest> CustomerRequests => _context.Set<CustomerRequest>();
    private DbSet<GarageSession> GarageSessions => _context.Set<GarageSession>();

    public async Task<CustomerRequestDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var request = await CustomerRequests
            .AsNoTracking()
            .Include(r => r.MediaItems)
            .Where(r => r.Id == id && r.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return request == null ? null : MapToDto(request);
    }

    public async Task<CustomerRequestDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var request = await CustomerRequests
            .AsNoTracking()
            .Include(r => r.MediaItems)
            .Where(r => r.SessionId == sessionId && r.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return request == null ? null : MapToDto(request);
    }

    public async Task<CustomerRequestDto> CreateAsync(CreateCustomerRequestDto dto, Guid companyId)
    {
        var request = new CustomerRequest
        {
            SessionId = dto.SessionId,
            CompanyId = companyId,
            Title = dto.Title,
            Description = dto.Description,
            CustomerConcerns = dto.CustomerConcerns,
            RequestedServices = dto.RequestedServices,
            Priority = dto.Priority,
            Notes = dto.Notes,
            Status = RequestStatus.Pending
        };

        CustomerRequests.Add(request);
        await _context.SaveChangesAsync();

        // Update session status
        await UpdateSessionStatus(dto.SessionId, SessionStatus.CustomerRequest);

        return MapToDto(request);
    }

    public async Task<CustomerRequestDto?> UpdateAsync(Guid id, UpdateCustomerRequestDto dto, Guid companyId)
    {
        var request = await CustomerRequests
            .Include(r => r.MediaItems)
            .Where(r => r.Id == id && r.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (request == null) return null;

        if (dto.Title != null) request.Title = dto.Title;
        if (dto.Description != null) request.Description = dto.Description;
        if (dto.Status.HasValue) request.Status = dto.Status.Value;
        if (dto.CustomerConcerns != null) request.CustomerConcerns = dto.CustomerConcerns;
        if (dto.RequestedServices != null) request.RequestedServices = dto.RequestedServices;
        if (dto.Priority.HasValue) request.Priority = dto.Priority.Value;
        if (dto.Notes != null) request.Notes = dto.Notes;

        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(request);
    }

    public async Task<bool> CompleteAsync(Guid id, Guid completedById, Guid companyId)
    {
        var request = await CustomerRequests
            .Where(r => r.Id == id && r.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (request == null) return false;

        request.Status = RequestStatus.Completed;
        request.CompletedAt = DateTime.UtcNow;
        request.CompletedById = completedById;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var request = await CustomerRequests
            .Where(r => r.Id == id && r.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (request == null) return false;

        CustomerRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task UpdateSessionStatus(Guid sessionId, SessionStatus status)
    {
        var session = await GarageSessions.FindAsync(sessionId);
        if (session != null && session.Status < status)
        {
            session.Status = status;
            session.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private static CustomerRequestDto MapToDto(CustomerRequest request)
    {
        return new CustomerRequestDto(
            Id: request.Id,
            SessionId: request.SessionId,
            Title: request.Title,
            Description: request.Description,
            Status: request.Status,
            CustomerConcerns: request.CustomerConcerns,
            RequestedServices: request.RequestedServices,
            Priority: request.Priority,
            Notes: request.Notes,
            CompletedAt: request.CompletedAt,
            MediaItems: request.MediaItems?.Select(m => new MediaItemDto(
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
            CreatedAt: request.CreatedAt
        );
    }
}
