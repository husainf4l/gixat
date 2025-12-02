using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Interfaces;
using TaskStatus = Gixat.Modules.Sessions.Enums.TaskStatus;

namespace Gixat.Modules.Sessions.Services;

public class ReportService : IReportService
{
    private readonly DbContext _context;

    public ReportService(DbContext context)
    {
        _context = context;
    }

    private DbSet<Entities.GarageSession> GarageSessions => _context.Set<Entities.GarageSession>();
    private DbSet<Entities.CustomerRequest> CustomerRequests => _context.Set<Entities.CustomerRequest>();
    private DbSet<Entities.Inspection> Inspections => _context.Set<Entities.Inspection>();
    private DbSet<Entities.TestDrive> TestDrives => _context.Set<Entities.TestDrive>();
    private DbSet<Entities.JobCard> JobCards => _context.Set<Entities.JobCard>();

    public async Task<InitialReportDto?> GenerateInitialReportAsync(Guid sessionId, Guid companyId, string generatedBy)
    {
        var session = await GarageSessions
            .AsNoTracking()
            .Where(s => s.Id == sessionId && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null) return null;

        // Get related data
        var customerRequest = await CustomerRequests
            .AsNoTracking()
            .Include(r => r.MediaItems)
            .Where(r => r.SessionId == sessionId)
            .FirstOrDefaultAsync();

        var inspection = await Inspections
            .AsNoTracking()
            .Include(i => i.Items)
            .Include(i => i.MediaItems)
            .Where(i => i.SessionId == sessionId)
            .FirstOrDefaultAsync();

        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.SessionId == sessionId)
            .FirstOrDefaultAsync();

        // Note: In production, you'd fetch client/vehicle info from Clients module
        // For now using placeholder values
        return new InitialReportDto(
            SessionId: session.Id,
            SessionNumber: session.SessionNumber,
            SessionStatus: session.Status,
            CheckInAt: session.CheckInAt,
            MileageIn: session.MileageIn,
            EstimatedCompletionAt: session.EstimatedCompletionAt,
            
            ClientId: session.ClientId,
            ClientName: "Client Name", // Placeholder - fetch from Clients module
            ClientPhone: null,
            ClientEmail: null,
            
            VehicleId: session.ClientVehicleId,
            VehicleDisplayName: "Vehicle", // Placeholder
            VehicleMake: null,
            VehicleModel: null,
            VehicleYear: null,
            VehicleColor: null,
            VehicleLicensePlate: null,
            VehicleVin: null,
            
            CustomerRequest: customerRequest == null ? null : new CustomerRequestSummaryDto(
                Id: customerRequest.Id,
                Title: customerRequest.Title,
                Description: customerRequest.Description,
                Status: customerRequest.Status,
                CustomerConcerns: customerRequest.CustomerConcerns,
                RequestedServices: customerRequest.RequestedServices,
                Priority: customerRequest.Priority,
                MediaCount: customerRequest.MediaItems?.Count ?? 0,
                CreatedAt: customerRequest.CreatedAt
            ),
            
            Inspection: inspection == null ? null : new InspectionSummaryDto(
                Id: inspection.Id,
                Title: inspection.Title,
                Status: inspection.Status,
                InspectorId: inspection.InspectorId,
                InspectorName: null, // Placeholder
                InspectionCompletedAt: inspection.InspectionCompletedAt,
                Findings: inspection.Findings,
                Recommendations: inspection.Recommendations,
                OverallPriority: inspection.OverallPriority,
                ItemsCount: inspection.Items?.Count ?? 0,
                ItemsRequiringAttention: inspection.Items?.Count(i => i.RequiresAttention) ?? 0,
                MediaCount: inspection.MediaItems?.Count ?? 0,
                CreatedAt: inspection.CreatedAt
            ),
            
            TestDrive: testDrive == null ? null : new TestDriveSummaryDto(
                Id: testDrive.Id,
                Title: testDrive.Title,
                Status: testDrive.Status,
                DriverId: testDrive.DriverId,
                DriverName: null, // Placeholder
                CompletedAt: testDrive.CompletedAt,
                MileageStart: testDrive.MileageStart,
                MileageEnd: testDrive.MileageEnd,
                Findings: testDrive.Findings,
                Recommendations: testDrive.Recommendations,
                OverallPriority: testDrive.OverallPriority,
                MediaCount: testDrive.MediaItems?.Count ?? 0,
                CreatedAt: testDrive.CreatedAt
            ),
            
            GeneratedAt: DateTime.UtcNow,
            GeneratedBy: generatedBy
        );
    }

    public async Task<FinalReportDto?> GenerateFinalReportAsync(Guid sessionId, Guid companyId, string generatedBy)
    {
        var session = await GarageSessions
            .AsNoTracking()
            .Where(s => s.Id == sessionId && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null) return null;

        // Get all related data
        var customerRequest = await CustomerRequests
            .AsNoTracking()
            .Include(r => r.MediaItems)
            .Where(r => r.SessionId == sessionId)
            .FirstOrDefaultAsync();

        var inspection = await Inspections
            .AsNoTracking()
            .Include(i => i.Items)
            .Include(i => i.MediaItems)
            .Where(i => i.SessionId == sessionId)
            .FirstOrDefaultAsync();

        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.SessionId == sessionId)
            .FirstOrDefaultAsync();

        var jobCard = await JobCards
            .AsNoTracking()
            .Include(j => j.Items)
            .Include(j => j.MediaItems)
            .Where(j => j.SessionId == sessionId)
            .FirstOrDefaultAsync();

        return new FinalReportDto(
            SessionId: session.Id,
            SessionNumber: session.SessionNumber,
            SessionStatus: session.Status,
            CheckInAt: session.CheckInAt,
            CheckOutAt: session.CheckOutAt,
            MileageIn: session.MileageIn,
            MileageOut: session.MileageOut,
            
            ClientId: session.ClientId,
            ClientName: "Client Name", // Placeholder
            ClientPhone: null,
            ClientEmail: null,
            
            VehicleId: session.ClientVehicleId,
            VehicleDisplayName: "Vehicle", // Placeholder
            VehicleMake: null,
            VehicleModel: null,
            VehicleYear: null,
            VehicleColor: null,
            VehicleLicensePlate: null,
            VehicleVin: null,
            
            CustomerRequest: customerRequest == null ? null : new CustomerRequestSummaryDto(
                Id: customerRequest.Id,
                Title: customerRequest.Title,
                Description: customerRequest.Description,
                Status: customerRequest.Status,
                CustomerConcerns: customerRequest.CustomerConcerns,
                RequestedServices: customerRequest.RequestedServices,
                Priority: customerRequest.Priority,
                MediaCount: customerRequest.MediaItems?.Count ?? 0,
                CreatedAt: customerRequest.CreatedAt
            ),
            
            Inspection: inspection == null ? null : new InspectionSummaryDto(
                Id: inspection.Id,
                Title: inspection.Title,
                Status: inspection.Status,
                InspectorId: inspection.InspectorId,
                InspectorName: null,
                InspectionCompletedAt: inspection.InspectionCompletedAt,
                Findings: inspection.Findings,
                Recommendations: inspection.Recommendations,
                OverallPriority: inspection.OverallPriority,
                ItemsCount: inspection.Items?.Count ?? 0,
                ItemsRequiringAttention: inspection.Items?.Count(i => i.RequiresAttention) ?? 0,
                MediaCount: inspection.MediaItems?.Count ?? 0,
                CreatedAt: inspection.CreatedAt
            ),
            
            TestDrive: testDrive == null ? null : new TestDriveSummaryDto(
                Id: testDrive.Id,
                Title: testDrive.Title,
                Status: testDrive.Status,
                DriverId: testDrive.DriverId,
                DriverName: null,
                CompletedAt: testDrive.CompletedAt,
                MileageStart: testDrive.MileageStart,
                MileageEnd: testDrive.MileageEnd,
                Findings: testDrive.Findings,
                Recommendations: testDrive.Recommendations,
                OverallPriority: testDrive.OverallPriority,
                MediaCount: testDrive.MediaItems?.Count ?? 0,
                CreatedAt: testDrive.CreatedAt
            ),
            
            JobCard: jobCard == null ? null : new JobCardSummaryDto(
                Id: jobCard.Id,
                JobCardNumber: jobCard.JobCardNumber,
                Title: jobCard.Title,
                Status: jobCard.Status,
                Priority: jobCard.Priority,
                ActualStartAt: jobCard.ActualStartAt,
                ActualCompletionAt: jobCard.ActualCompletionAt,
                EstimatedHours: jobCard.EstimatedHours,
                ActualHours: jobCard.ActualHours,
                IsApproved: jobCard.IsApproved,
                CustomerAuthorized: jobCard.CustomerAuthorized,
                WorkSummary: jobCard.WorkSummary,
                Items: jobCard.Items?.Select(i => new JobCardItemSummaryDto(
                    Id: i.Id,
                    Title: i.Title,
                    Category: i.Category,
                    Status: i.Status,
                    Priority: i.Priority,
                    WorkPerformed: i.WorkPerformed,
                    EstimatedHours: i.EstimatedHours,
                    ActualHours: i.ActualHours,
                    QualityChecked: i.QualityChecked
                )) ?? Enumerable.Empty<JobCardItemSummaryDto>(),
                TotalItems: jobCard.Items?.Count ?? 0,
                CompletedItems: jobCard.Items?.Count(i => i.Status == TaskStatus.Completed) ?? 0,
                MediaCount: jobCard.MediaItems?.Count ?? 0,
                CreatedAt: jobCard.CreatedAt
            ),
            
            GeneratedAt: DateTime.UtcNow,
            GeneratedBy: generatedBy
        );
    }
}
