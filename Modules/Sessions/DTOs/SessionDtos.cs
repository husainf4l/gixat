using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Sessions.Entities;

namespace Gixat.Web.Modules.Sessions.DTOs;

// ============================================
// Session DTOs
// ============================================

public record SessionDto(
    Guid Id,
    string SessionNumber,
    SessionStatus Status,
    Guid CompanyId,
    Guid BranchId,
    Guid ClientId,
    string ClientName,
    Guid ClientVehicleId,
    string VehicleDisplayName,
    string? VehicleLicensePlate,
    int? MileageIn,
    int? MileageOut,
    DateTime CheckInAt,
    DateTime? CheckOutAt,
    DateTime? EstimatedCompletionAt,
    Guid? ServiceAdvisorId,
    Guid? TechnicianId,
    string? Notes,
    bool HasCustomerRequest,
    bool HasInspection,
    bool HasTestDrive,
    bool HasJobCard,
    DateTime CreatedAt
);

public record CreateSessionDto(
    Guid CompanyId,
    Guid BranchId,
    Guid ClientId,
    Guid ClientVehicleId,
    int? MileageIn,
    DateTime? EstimatedCompletionAt,
    Guid? ServiceAdvisorId,
    string? Notes
);

public record UpdateSessionDto(
    SessionStatus? Status,
    int? MileageIn,
    int? MileageOut,
    DateTime? EstimatedCompletionAt,
    Guid? ServiceAdvisorId,
    Guid? TechnicianId,
    string? Notes,
    string? InternalNotes
);

// ============================================
// Customer Request DTOs
// ============================================

public record CustomerRequestDto(
    Guid Id,
    Guid SessionId,
    string Title,
    string? Description,
    RequestStatus Status,
    string? CustomerConcerns,
    string? RequestedServices,
    Priority Priority,
    string? Notes,
    DateTime? CompletedAt,
    IEnumerable<MediaItemDto> MediaItems,
    DateTime CreatedAt
);

public record CreateCustomerRequestDto(
    Guid SessionId,
    string Title,
    string? Description,
    string? CustomerConcerns,
    string? RequestedServices,
    Priority Priority = Priority.Normal,
    string? Notes = null
);

public record UpdateCustomerRequestDto(
    string? Title,
    string? Description,
    RequestStatus? Status,
    string? CustomerConcerns,
    string? RequestedServices,
    Priority? Priority,
    string? Notes
);

// ============================================
// Inspection DTOs
// ============================================

public record InspectionDto(
    Guid Id,
    Guid SessionId,
    string Title,
    string? Description,
    RequestStatus Status,
    Guid? InspectorId,
    DateTime? InspectionStartedAt,
    DateTime? InspectionCompletedAt,
    string? ExteriorCondition,
    string? InteriorCondition,
    string? EngineCondition,
    string? TransmissionCondition,
    string? BrakeCondition,
    string? TireCondition,
    string? SuspensionCondition,
    string? ElectricalCondition,
    string? FluidLevels,
    string? Findings,
    string? Recommendations,
    Priority OverallPriority,
    IEnumerable<InspectionItemDto> Items,
    IEnumerable<MediaItemDto> MediaItems,
    DateTime CreatedAt
);

public record CreateInspectionDto(
    Guid SessionId,
    string Title,
    string? Description = null,
    Priority OverallPriority = Priority.Normal
);

public record UpdateInspectionDto(
    string? Title,
    string? Description,
    RequestStatus? Status,
    Guid? InspectorId,
    string? ExteriorCondition,
    string? InteriorCondition,
    string? EngineCondition,
    string? TransmissionCondition,
    string? BrakeCondition,
    string? TireCondition,
    string? SuspensionCondition,
    string? ElectricalCondition,
    string? FluidLevels,
    string? Findings,
    string? Recommendations,
    Priority? OverallPriority,
    string? Notes
);

public record InspectionItemDto(
    Guid Id,
    string Category,
    string ItemName,
    string? Description,
    string? Condition,
    string? Notes,
    Priority Priority,
    bool RequiresAttention,
    int SortOrder
);

public record CreateInspectionItemDto(
    Guid InspectionId,
    string Category,
    string ItemName,
    string? Description = null,
    string? Condition = null,
    string? Notes = null,
    Priority Priority = Priority.Normal,
    bool RequiresAttention = false,
    int SortOrder = 0
);

// ============================================
// Test Drive DTOs
// ============================================

public record TestDriveDto(
    Guid Id,
    Guid SessionId,
    string Title,
    string? Description,
    RequestStatus Status,
    Guid? DriverId,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    int? MileageStart,
    int? MileageEnd,
    string? RouteDescription,
    string? EnginePerformance,
    string? TransmissionPerformance,
    string? BrakePerformance,
    string? SteeringPerformance,
    string? SuspensionPerformance,
    string? NoiseObservations,
    string? VibrationObservations,
    string? ElectricalObservations,
    string? AcPerformance,
    string? Findings,
    string? Recommendations,
    Priority OverallPriority,
    IEnumerable<MediaItemDto> MediaItems,
    DateTime CreatedAt
);

public record CreateTestDriveDto(
    Guid SessionId,
    string Title,
    string? Description = null,
    int? MileageStart = null,
    Priority OverallPriority = Priority.Normal
);

public record UpdateTestDriveDto(
    string? Title,
    string? Description,
    RequestStatus? Status,
    Guid? DriverId,
    int? MileageStart,
    int? MileageEnd,
    string? RouteDescription,
    string? EnginePerformance,
    string? TransmissionPerformance,
    string? BrakePerformance,
    string? SteeringPerformance,
    string? SuspensionPerformance,
    string? NoiseObservations,
    string? VibrationObservations,
    string? ElectricalObservations,
    string? AcPerformance,
    string? Findings,
    string? Recommendations,
    Priority? OverallPriority,
    string? Notes
);

// ============================================
// Job Card DTOs
// ============================================

public record JobCardDto(
    Guid Id,
    Guid SessionId,
    string JobCardNumber,
    string Title,
    string? Description,
    JobCardStatus Status,
    Priority Priority,
    DateTime? EstimatedStartAt,
    DateTime? EstimatedCompletionAt,
    DateTime? ActualStartAt,
    DateTime? ActualCompletionAt,
    decimal EstimatedHours,
    decimal ActualHours,
    Guid? SupervisorId,
    Guid? PrimaryTechnicianId,
    bool IsApproved,
    DateTime? ApprovedAt,
    bool CustomerAuthorized,
    DateTime? CustomerAuthorizedAt,
    string? CustomerAuthorizationMethod,
    string? WorkSummary,
    string? TechnicianNotes,
    IEnumerable<JobCardItemDto> Items,
    IEnumerable<MediaItemDto> MediaItems,
    DateTime CreatedAt
);

public record CreateJobCardDto(
    Guid SessionId,
    string Title,
    string? Description = null,
    Priority Priority = Priority.Normal,
    DateTime? EstimatedStartAt = null,
    DateTime? EstimatedCompletionAt = null,
    decimal EstimatedHours = 0,
    Guid? SupervisorId = null,
    Guid? PrimaryTechnicianId = null
);

public record UpdateJobCardDto(
    string? Title,
    string? Description,
    JobCardStatus? Status,
    Priority? Priority,
    DateTime? EstimatedStartAt,
    DateTime? EstimatedCompletionAt,
    decimal? EstimatedHours,
    Guid? SupervisorId,
    Guid? PrimaryTechnicianId,
    string? WorkSummary,
    string? TechnicianNotes,
    string? QualityNotes,
    string? Notes,
    string? InternalNotes
);

public record ApproveJobCardDto(
    string? ApprovalNotes = null
);

public record AuthorizeJobCardDto(
    string AuthorizationMethod,
    string? Notes = null
);

public record JobCardItemDto(
    Guid Id,
    string Title,
    string? Description,
    string? Category,
    Enums.TaskStatus Status,
    Priority Priority,
    string? Source,
    Guid? SourceId,
    Guid? TechnicianId,
    decimal EstimatedHours,
    decimal ActualHours,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    string? WorkPerformed,
    string? TechnicianNotes,
    bool QualityChecked,
    int SortOrder,
    IEnumerable<MediaItemDto> MediaItems
);

public record CreateJobCardItemDto(
    Guid JobCardId,
    string Title,
    string? Description = null,
    string? Category = null,
    Priority Priority = Priority.Normal,
    string? Source = null,
    Guid? SourceId = null,
    Guid? TechnicianId = null,
    decimal EstimatedHours = 0,
    int SortOrder = 0
);

public record UpdateJobCardItemDto(
    string? Title,
    string? Description,
    string? Category,
    Enums.TaskStatus? Status,
    Priority? Priority,
    Guid? TechnicianId,
    decimal? EstimatedHours,
    decimal? ActualHours,
    string? WorkPerformed,
    string? TechnicianNotes,
    string? Notes
);

// ============================================
// Job Card Comments DTOs
// ============================================

public record JobCardCommentDto(
    Guid Id,
    Guid JobCardId,
    Guid AuthorId,
    string AuthorName,
    string Content,
    CommentType Type,
    string? MentionedUserIds,
    bool HasAttachment,
    string? AttachmentUrl,
    string? AttachmentName,
    bool IsResolved,
    DateTime? ResolvedAt,
    Guid? ResolvedById,
    Guid? ParentCommentId,
    IEnumerable<JobCardCommentDto>? Replies,
    DateTime CreatedAt
);

public record CreateJobCardCommentDto(
    Guid JobCardId,
    string Content,
    CommentType Type = CommentType.General,
    string? MentionedUserIds = null,
    Guid? ParentCommentId = null,
    string? AttachmentUrl = null,
    string? AttachmentName = null
);

// ============================================
// Job Card Time Entries DTOs
// ============================================

public record JobCardTimeEntryDto(
    Guid Id,
    Guid JobCardId,
    Guid? JobCardItemId,
    Guid TechnicianId,
    string TechnicianName,
    DateTime StartTime,
    DateTime? EndTime,
    decimal Hours,
    bool IsActive,
    string? Description,
    string? Notes,
    bool IsBillable,
    decimal HourlyRate,
    decimal TotalCost,
    decimal BreakMinutes,
    DateTime CreatedAt
);

public record CreateJobCardTimeEntryDto(
    Guid JobCardId,
    Guid? JobCardItemId = null,
    string? Description = null,
    bool IsBillable = true,
    decimal HourlyRate = 0
);

// ============================================
// Job Card Parts DTOs
// ============================================

public record JobCardPartDto(
    Guid Id,
    Guid JobCardId,
    Guid? JobCardItemId,
    Guid? InventoryItemId,
    string PartNumber,
    string PartName,
    string? Description,
    decimal QuantityUsed,
    string Unit,
    decimal UnitCost,
    decimal UnitPrice,
    decimal Markup,
    decimal TotalCost,
    decimal TotalPrice,
    PartSource Source,
    string? Supplier,
    string? SupplierPartNumber,
    PartStatus Status,
    DateTime? OrderedAt,
    DateTime? ReceivedAt,
    DateTime? InstalledAt,
    bool HasWarranty,
    int WarrantyMonths,
    string? WarrantyInfo,
    string? Notes,
    Guid? AddedById,
    DateTime CreatedAt
);

public record CreateJobCardPartDto(
    Guid JobCardId,
    Guid? JobCardItemId = null,
    Guid? InventoryItemId = null,
    string PartNumber = "",
    string PartName = "",
    string? Description = null,
    decimal QuantityUsed = 1,
    string Unit = "pcs",
    decimal UnitCost = 0,
    decimal UnitPrice = 0,
    decimal Markup = 0,
    PartSource Source = PartSource.InStock,
    string? Supplier = null,
    string? SupplierPartNumber = null,
    bool HasWarranty = false,
    int WarrantyMonths = 0,
    string? WarrantyInfo = null,
    string? Notes = null
);

public record UpdateJobCardPartDto(
    decimal? QuantityUsed,
    decimal? UnitCost,
    decimal? UnitPrice,
    decimal? Markup,
    PartSource? Source,
    string? Supplier,
    string? SupplierPartNumber,
    PartStatus? Status,
    bool? HasWarranty,
    int? WarrantyMonths,
    string? WarrantyInfo,
    string? Notes
);

// ============================================
// Media DTOs
// ============================================

public record MediaItemDto(
    Guid Id,
    string FileName,
    string OriginalFileName,
    string ContentType,
    long FileSize,
    string S3Key,
    string? S3Url,
    MediaType MediaType,
    MediaCategory Category,
    string? Title,
    string? Description,
    string? ThumbnailS3Key,
    int SortOrder,
    DateTime CreatedAt
);

public record CreateMediaItemDto(
    Guid SessionId,
    string OriginalFileName,
    string ContentType,
    long FileSize,
    MediaType MediaType,
    MediaCategory Category,
    Guid? CustomerRequestId = null,
    Guid? InspectionId = null,
    Guid? TestDriveId = null,
    Guid? JobCardId = null,
    Guid? JobCardItemId = null,
    string? Title = null,
    string? Description = null,
    string? Tags = null,
    int SortOrder = 0
);

public record MediaUploadUrlDto(
    Guid MediaItemId,
    string UploadUrl,
    string S3Key,
    DateTime ExpiresAt
);

public record MediaDownloadUrlDto(
    Guid MediaItemId,
    string DownloadUrl,
    DateTime ExpiresAt
);
