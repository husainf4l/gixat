using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Users.Entities;
using Gixat.Shared.Services;

namespace Gixat.Modules.Sessions.Services;

public class ReportService : BaseService, IReportService
{
    private readonly ILogger<ReportService> _logger;

    public ReportService(DbContext context, ILogger<ReportService> logger) : base(context)
    {
        _logger = logger;
    }

    private DbSet<GarageSession> Sessions => Set<GarageSession>();
    private DbSet<CustomerRequest> CustomerRequests => Set<CustomerRequest>();
    private DbSet<Inspection> Inspections => Set<Inspection>();
    private DbSet<TestDrive> TestDrives => Set<TestDrive>();
    private DbSet<JobCard> JobCards => Set<JobCard>();
    private DbSet<Client> Clients => Set<Client>();
    private DbSet<ClientVehicle> ClientVehicles => Set<ClientVehicle>();
    private DbSet<CompanyUser> CompanyUsers => Set<CompanyUser>();

    public async Task<InitialReportDto?> GenerateInitialReportAsync(Guid sessionId, Guid companyId, string generatedBy)
    {
        _logger.LogInformation("Generating initial report for session {SessionId}", sessionId);

        var session = await Sessions
            .AsNoTracking()
            .Where(s => s.Id == sessionId && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null)
        {
            _logger.LogWarning("Session {SessionId} not found for company {CompanyId}", sessionId, companyId);
            return null;
        }

        // Fetch client data
        var client = await Clients
            .AsNoTracking()
            .Where(c => c.Id == session.ClientId)
            .FirstOrDefaultAsync();

        // Fetch vehicle data
        var vehicle = await ClientVehicles
            .AsNoTracking()
            .Where(v => v.Id == session.ClientVehicleId)
            .FirstOrDefaultAsync();

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

        // Fetch inspector name if inspection exists
        string? inspectorName = null;
        if (inspection?.InspectorId != null)
        {
            inspectorName = await CompanyUsers
                .AsNoTracking()
                .Where(u => u.Id == inspection.InspectorId)
                .Select(u => u.FirstName + " " + u.LastName)
                .FirstOrDefaultAsync();
        }

        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.SessionId == sessionId)
            .FirstOrDefaultAsync();

        // Fetch driver name if test drive exists
        string? driverName = null;
        if (testDrive?.DriverId != null)
        {
            driverName = await CompanyUsers
                .AsNoTracking()
                .Where(u => u.Id == testDrive.DriverId)
                .Select(u => u.FirstName + " " + u.LastName)
                .FirstOrDefaultAsync();
        }

        _logger.LogInformation("Initial report generated successfully for session {SessionId}", sessionId);

        return new InitialReportDto(
            SessionId: session.Id,
            SessionNumber: session.SessionNumber,
            SessionStatus: session.Status,
            CheckInAt: session.CheckInAt,
            MileageIn: session.MileageIn,
            EstimatedCompletionAt: session.EstimatedCompletionAt,
            ClientId: session.ClientId,
            ClientName: client?.FullName ?? "Unknown Client",
            ClientPhone: client?.Phone,
            ClientEmail: client?.Email,
            VehicleId: session.ClientVehicleId,
            VehicleDisplayName: vehicle?.DisplayName ?? "Unknown Vehicle",
            VehicleMake: vehicle?.Make,
            VehicleModel: vehicle?.Model,
            VehicleYear: vehicle?.Year,
            VehicleColor: vehicle?.Color,
            VehicleLicensePlate: vehicle?.LicensePlate,
            VehicleVin: vehicle?.Vin,
            CustomerRequest: customerRequest != null ? new CustomerRequestSummaryDto(
                Id: customerRequest.Id,
                Title: customerRequest.Title,
                Description: customerRequest.Description,
                Status: customerRequest.Status,
                CustomerConcerns: customerRequest.CustomerConcerns,
                RequestedServices: customerRequest.RequestedServices,
                Priority: customerRequest.Priority,
                MediaCount: customerRequest.MediaItems?.Count ?? 0,
                CreatedAt: customerRequest.CreatedAt
            ) : null,
            Inspection: inspection != null ? new InspectionSummaryDto(
                Id: inspection.Id,
                Title: inspection.Title,
                Status: inspection.Status,
                InspectorId: inspection.InspectorId,
                InspectorName: inspectorName,
                InspectionCompletedAt: inspection.InspectionCompletedAt,
                Findings: inspection.Findings,
                Recommendations: inspection.Recommendations,
                OverallPriority: inspection.OverallPriority,
                ItemsCount: inspection.Items?.Count ?? 0,
                ItemsRequiringAttention: inspection.Items?.Count(i => i.RequiresAttention) ?? 0,
                MediaCount: inspection.MediaItems?.Count ?? 0,
                CreatedAt: inspection.CreatedAt
            ) : null,
            TestDrive: testDrive != null ? new TestDriveSummaryDto(
                Id: testDrive.Id,
                Title: testDrive.Title,
                Status: testDrive.Status,
                DriverId: testDrive.DriverId,
                DriverName: driverName,
                CompletedAt: testDrive.CompletedAt,
                MileageStart: testDrive.MileageStart,
                MileageEnd: testDrive.MileageEnd,
                Findings: testDrive.Findings,
                Recommendations: testDrive.Recommendations,
                OverallPriority: testDrive.OverallPriority,
                MediaCount: testDrive.MediaItems?.Count ?? 0,
                CreatedAt: testDrive.CreatedAt
            ) : null,
            GeneratedAt: DateTime.UtcNow,
            GeneratedBy: generatedBy
        );
    }

    public async Task<FinalReportDto?> GenerateFinalReportAsync(Guid sessionId, Guid companyId, string generatedBy)
    {
        _logger.LogInformation("Generating final report for session {SessionId}", sessionId);

        var session = await Sessions
            .AsNoTracking()
            .Where(s => s.Id == sessionId && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null)
        {
            _logger.LogWarning("Session {SessionId} not found for company {CompanyId}", sessionId, companyId);
            return null;
        }

        // Fetch client data
        var client = await Clients
            .AsNoTracking()
            .Where(c => c.Id == session.ClientId)
            .FirstOrDefaultAsync();

        // Fetch vehicle data
        var vehicle = await ClientVehicles
            .AsNoTracking()
            .Where(v => v.Id == session.ClientVehicleId)
            .FirstOrDefaultAsync();

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

        // Fetch inspector name
        string? inspectorName = null;
        if (inspection?.InspectorId != null)
        {
            inspectorName = await CompanyUsers
                .AsNoTracking()
                .Where(u => u.Id == inspection.InspectorId)
                .Select(u => u.FirstName + " " + u.LastName)
                .FirstOrDefaultAsync();
        }

        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.SessionId == sessionId)
            .FirstOrDefaultAsync();

        // Fetch driver name
        string? driverName = null;
        if (testDrive?.DriverId != null)
        {
            driverName = await CompanyUsers
                .AsNoTracking()
                .Where(u => u.Id == testDrive.DriverId)
                .Select(u => u.FirstName + " " + u.LastName)
                .FirstOrDefaultAsync();
        }

        var jobCard = await JobCards
            .AsNoTracking()
            .Include(j => j.Items)
            .Include(j => j.MediaItems)
            .Where(j => j.SessionId == sessionId)
            .FirstOrDefaultAsync();

        _logger.LogInformation("Final report generated successfully for session {SessionId}", sessionId);

        return new FinalReportDto(
            SessionId: session.Id,
            SessionNumber: session.SessionNumber,
            SessionStatus: session.Status,
            CheckInAt: session.CheckInAt,
            CheckOutAt: session.CheckOutAt,
            MileageIn: session.MileageIn,
            MileageOut: session.MileageOut,
            ClientId: session.ClientId,
            ClientName: client?.FullName ?? "Unknown Client",
            ClientPhone: client?.Phone,
            ClientEmail: client?.Email,
            VehicleId: session.ClientVehicleId,
            VehicleDisplayName: vehicle?.DisplayName ?? "Unknown Vehicle",
            VehicleMake: vehicle?.Make,
            VehicleModel: vehicle?.Model,
            VehicleYear: vehicle?.Year,
            VehicleColor: vehicle?.Color,
            VehicleLicensePlate: vehicle?.LicensePlate,
            VehicleVin: vehicle?.Vin,
            CustomerRequest: customerRequest != null ? new CustomerRequestSummaryDto(
                Id: customerRequest.Id,
                Title: customerRequest.Title,
                Description: customerRequest.Description,
                Status: customerRequest.Status,
                CustomerConcerns: customerRequest.CustomerConcerns,
                RequestedServices: customerRequest.RequestedServices,
                Priority: customerRequest.Priority,
                MediaCount: customerRequest.MediaItems?.Count ?? 0,
                CreatedAt: customerRequest.CreatedAt
            ) : null,
            Inspection: inspection != null ? new InspectionSummaryDto(
                Id: inspection.Id,
                Title: inspection.Title,
                Status: inspection.Status,
                InspectorId: inspection.InspectorId,
                InspectorName: inspectorName,
                InspectionCompletedAt: inspection.InspectionCompletedAt,
                Findings: inspection.Findings,
                Recommendations: inspection.Recommendations,
                OverallPriority: inspection.OverallPriority,
                ItemsCount: inspection.Items?.Count ?? 0,
                ItemsRequiringAttention: inspection.Items?.Count(i => i.RequiresAttention) ?? 0,
                MediaCount: inspection.MediaItems?.Count ?? 0,
                CreatedAt: inspection.CreatedAt
            ) : null,
            TestDrive: testDrive != null ? new TestDriveSummaryDto(
                Id: testDrive.Id,
                Title: testDrive.Title,
                Status: testDrive.Status,
                DriverId: testDrive.DriverId,
                DriverName: driverName,
                CompletedAt: testDrive.CompletedAt,
                MileageStart: testDrive.MileageStart,
                MileageEnd: testDrive.MileageEnd,
                Findings: testDrive.Findings,
                Recommendations: testDrive.Recommendations,
                OverallPriority: testDrive.OverallPriority,
                MediaCount: testDrive.MediaItems?.Count ?? 0,
                CreatedAt: testDrive.CreatedAt
            ) : null,
            JobCard: jobCard != null ? new JobCardSummaryDto(
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
                )) ?? [],
                TotalItems: jobCard.Items?.Count ?? 0,
                CompletedItems: jobCard.Items?.Count(i => i.Status == Enums.TaskStatus.Completed) ?? 0,
                MediaCount: jobCard.MediaItems?.Count ?? 0,
                CreatedAt: jobCard.CreatedAt
            ) : null,
            GeneratedAt: DateTime.UtcNow,
            GeneratedBy: generatedBy
        );
    }
}
