using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Sessions.Data;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;

namespace Gixat.Modules.Sessions.Services;

public class InspectionService : IInspectionService
{
    private readonly SessionDbContext _context;

    public InspectionService(SessionDbContext context)
    {
        _context = context;
    }

    public async Task<InspectionDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var inspection = await _context.Inspections
            .AsNoTracking()
            .Include(i => i.Items.OrderBy(item => item.SortOrder))
            .Include(i => i.MediaItems)
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return inspection == null ? null : MapToDto(inspection);
    }

    public async Task<InspectionDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var inspection = await _context.Inspections
            .AsNoTracking()
            .Include(i => i.Items.OrderBy(item => item.SortOrder))
            .Include(i => i.MediaItems)
            .Where(i => i.SessionId == sessionId && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return inspection == null ? null : MapToDto(inspection);
    }

    public async Task<InspectionDto> CreateAsync(CreateInspectionDto dto, Guid companyId)
    {
        var inspection = new Inspection
        {
            SessionId = dto.SessionId,
            CompanyId = companyId,
            Title = dto.Title,
            Description = dto.Description,
            OverallPriority = dto.OverallPriority,
            Status = RequestStatus.Pending
        };

        _context.Inspections.Add(inspection);
        await _context.SaveChangesAsync();

        // Update session status
        await UpdateSessionStatus(dto.SessionId, SessionStatus.Inspection);

        return MapToDto(inspection);
    }

    public async Task<InspectionDto?> UpdateAsync(Guid id, UpdateInspectionDto dto, Guid companyId)
    {
        var inspection = await _context.Inspections
            .Include(i => i.Items)
            .Include(i => i.MediaItems)
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (inspection == null) return null;

        if (dto.Title != null) inspection.Title = dto.Title;
        if (dto.Description != null) inspection.Description = dto.Description;
        if (dto.Status.HasValue) inspection.Status = dto.Status.Value;
        if (dto.InspectorId.HasValue) inspection.InspectorId = dto.InspectorId.Value;
        if (dto.ExteriorCondition != null) inspection.ExteriorCondition = dto.ExteriorCondition;
        if (dto.InteriorCondition != null) inspection.InteriorCondition = dto.InteriorCondition;
        if (dto.EngineCondition != null) inspection.EngineCondition = dto.EngineCondition;
        if (dto.TransmissionCondition != null) inspection.TransmissionCondition = dto.TransmissionCondition;
        if (dto.BrakeCondition != null) inspection.BrakeCondition = dto.BrakeCondition;
        if (dto.TireCondition != null) inspection.TireCondition = dto.TireCondition;
        if (dto.SuspensionCondition != null) inspection.SuspensionCondition = dto.SuspensionCondition;
        if (dto.ElectricalCondition != null) inspection.ElectricalCondition = dto.ElectricalCondition;
        if (dto.FluidLevels != null) inspection.FluidLevels = dto.FluidLevels;
        if (dto.Findings != null) inspection.Findings = dto.Findings;
        if (dto.Recommendations != null) inspection.Recommendations = dto.Recommendations;
        if (dto.OverallPriority.HasValue) inspection.OverallPriority = dto.OverallPriority.Value;
        if (dto.Notes != null) inspection.Notes = dto.Notes;

        inspection.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(inspection);
    }

    public async Task<bool> StartInspectionAsync(Guid id, Guid inspectorId, Guid companyId)
    {
        var inspection = await _context.Inspections
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (inspection == null) return false;

        inspection.Status = RequestStatus.InProgress;
        inspection.InspectorId = inspectorId;
        inspection.InspectionStartedAt = DateTime.UtcNow;
        inspection.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CompleteInspectionAsync(Guid id, Guid companyId)
    {
        var inspection = await _context.Inspections
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (inspection == null) return false;

        inspection.Status = RequestStatus.Completed;
        inspection.InspectionCompletedAt = DateTime.UtcNow;
        inspection.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var inspection = await _context.Inspections
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (inspection == null) return false;

        _context.Inspections.Remove(inspection);
        await _context.SaveChangesAsync();
        return true;
    }

    // Inspection Items
    public async Task<InspectionItemDto> AddItemAsync(CreateInspectionItemDto dto)
    {
        var item = new InspectionItem
        {
            InspectionId = dto.InspectionId,
            Category = dto.Category,
            ItemName = dto.ItemName,
            Description = dto.Description,
            Condition = dto.Condition,
            Notes = dto.Notes,
            Priority = dto.Priority,
            RequiresAttention = dto.RequiresAttention,
            SortOrder = dto.SortOrder
        };

        _context.InspectionItems.Add(item);
        await _context.SaveChangesAsync();

        return MapItemToDto(item);
    }

    public async Task<bool> UpdateItemAsync(Guid itemId, string? condition, string? notes, Priority? priority, bool? requiresAttention)
    {
        var item = await _context.InspectionItems.FindAsync(itemId);
        if (item == null) return false;

        if (condition != null) item.Condition = condition;
        if (notes != null) item.Notes = notes;
        if (priority.HasValue) item.Priority = priority.Value;
        if (requiresAttention.HasValue) item.RequiresAttention = requiresAttention.Value;

        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveItemAsync(Guid itemId)
    {
        var item = await _context.InspectionItems.FindAsync(itemId);
        if (item == null) return false;

        _context.InspectionItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task UpdateSessionStatus(Guid sessionId, SessionStatus status)
    {
        var session = await _context.GarageSessions.FindAsync(sessionId);
        if (session != null && session.Status < status)
        {
            session.Status = status;
            session.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private static InspectionDto MapToDto(Inspection inspection)
    {
        return new InspectionDto(
            Id: inspection.Id,
            SessionId: inspection.SessionId,
            Title: inspection.Title,
            Description: inspection.Description,
            Status: inspection.Status,
            InspectorId: inspection.InspectorId,
            InspectionStartedAt: inspection.InspectionStartedAt,
            InspectionCompletedAt: inspection.InspectionCompletedAt,
            ExteriorCondition: inspection.ExteriorCondition,
            InteriorCondition: inspection.InteriorCondition,
            EngineCondition: inspection.EngineCondition,
            TransmissionCondition: inspection.TransmissionCondition,
            BrakeCondition: inspection.BrakeCondition,
            TireCondition: inspection.TireCondition,
            SuspensionCondition: inspection.SuspensionCondition,
            ElectricalCondition: inspection.ElectricalCondition,
            FluidLevels: inspection.FluidLevels,
            Findings: inspection.Findings,
            Recommendations: inspection.Recommendations,
            OverallPriority: inspection.OverallPriority,
            Items: inspection.Items?.Select(MapItemToDto) ?? Enumerable.Empty<InspectionItemDto>(),
            MediaItems: inspection.MediaItems?.Select(m => new MediaItemDto(
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
            CreatedAt: inspection.CreatedAt
        );
    }

    private static InspectionItemDto MapItemToDto(InspectionItem item)
    {
        return new InspectionItemDto(
            Id: item.Id,
            Category: item.Category,
            ItemName: item.ItemName,
            Description: item.Description,
            Condition: item.Condition,
            Notes: item.Notes,
            Priority: item.Priority,
            RequiresAttention: item.RequiresAttention,
            SortOrder: item.SortOrder
        );
    }
}
