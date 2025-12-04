using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Modules.Sessions.DTOs;

/// <summary>
/// Initial Report - aggregates CustomerRequest, Inspection, TestDrive
/// Generated on-demand, not stored as an entity
/// </summary>
public record InitialReportDto(
    // Session Info
    Guid SessionId,
    string SessionNumber,
    SessionStatus SessionStatus,
    DateTime CheckInAt,
    int? MileageIn,
    DateTime? EstimatedCompletionAt,
    
    // Client Info
    Guid ClientId,
    string ClientName,
    string? ClientPhone,
    string? ClientEmail,
    
    // Vehicle Info
    Guid VehicleId,
    string VehicleDisplayName,
    string? VehicleMake,
    string? VehicleModel,
    int? VehicleYear,
    string? VehicleColor,
    string? VehicleLicensePlate,
    string? VehicleVin,
    
    // Customer Request Summary
    CustomerRequestSummaryDto? CustomerRequest,
    
    // Inspection Summary
    InspectionSummaryDto? Inspection,
    
    // Test Drive Summary
    TestDriveSummaryDto? TestDrive,
    
    // Generated Report Info
    DateTime GeneratedAt,
    string GeneratedBy
);

public record CustomerRequestSummaryDto(
    Guid Id,
    string Title,
    string? Description,
    RequestStatus Status,
    string? CustomerConcerns,
    string? RequestedServices,
    Priority Priority,
    int MediaCount,
    DateTime CreatedAt
);

public record InspectionSummaryDto(
    Guid Id,
    string Title,
    RequestStatus Status,
    Guid? InspectorId,
    string? InspectorName,
    DateTime? InspectionCompletedAt,
    string? Findings,
    string? Recommendations,
    Priority OverallPriority,
    int ItemsCount,
    int ItemsRequiringAttention,
    int MediaCount,
    DateTime CreatedAt
);

public record TestDriveSummaryDto(
    Guid Id,
    string Title,
    RequestStatus Status,
    Guid? DriverId,
    string? DriverName,
    DateTime? CompletedAt,
    int? MileageStart,
    int? MileageEnd,
    string? Findings,
    string? Recommendations,
    Priority OverallPriority,
    int MediaCount,
    DateTime CreatedAt
);

/// <summary>
/// Final Report - extends InitialReport with JobCard results
/// Generated on-demand, not stored as an entity
/// </summary>
public record FinalReportDto(
    // Session Info
    Guid SessionId,
    string SessionNumber,
    SessionStatus SessionStatus,
    DateTime CheckInAt,
    DateTime? CheckOutAt,
    int? MileageIn,
    int? MileageOut,
    
    // Client Info
    Guid ClientId,
    string ClientName,
    string? ClientPhone,
    string? ClientEmail,
    
    // Vehicle Info
    Guid VehicleId,
    string VehicleDisplayName,
    string? VehicleMake,
    string? VehicleModel,
    int? VehicleYear,
    string? VehicleColor,
    string? VehicleLicensePlate,
    string? VehicleVin,
    
    // Customer Request Summary
    CustomerRequestSummaryDto? CustomerRequest,
    
    // Inspection Summary
    InspectionSummaryDto? Inspection,
    
    // Test Drive Summary
    TestDriveSummaryDto? TestDrive,
    
    // Job Card Summary
    JobCardSummaryDto? JobCard,
    
    // Generated Report Info
    DateTime GeneratedAt,
    string GeneratedBy
);

public record JobCardSummaryDto(
    Guid Id,
    string JobCardNumber,
    string Title,
    JobCardStatus Status,
    Priority Priority,
    DateTime? ActualStartAt,
    DateTime? ActualCompletionAt,
    decimal EstimatedHours,
    decimal ActualHours,
    bool IsApproved,
    bool CustomerAuthorized,
    string? WorkSummary,
    IEnumerable<JobCardItemSummaryDto> Items,
    int TotalItems,
    int CompletedItems,
    int MediaCount,
    DateTime CreatedAt
);

public record JobCardItemSummaryDto(
    Guid Id,
    string Title,
    string? Category,
    Enums.TaskStatus Status,
    Priority Priority,
    string? WorkPerformed,
    decimal EstimatedHours,
    decimal ActualHours,
    bool QualityChecked
);
