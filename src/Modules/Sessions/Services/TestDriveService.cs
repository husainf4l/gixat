using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Shared.Services;

namespace Gixat.Modules.Sessions.Services;

public class TestDriveService : BaseService, ITestDriveService
{
    private readonly ILogger<TestDriveService> _logger;

    public TestDriveService(DbContext context, ILogger<TestDriveService> logger) : base(context)
    {
        _logger = logger;
    }

    private DbSet<TestDrive> TestDrives => Set<TestDrive>();
    private DbSet<GarageSession> GarageSessions => Set<GarageSession>();

    public async Task<TestDriveDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.Id == id && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return testDrive?.ToDto();
    }

    public async Task<TestDriveDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.SessionId == sessionId && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return testDrive?.ToDto();
    }

    public async Task<TestDriveDto> CreateAsync(CreateTestDriveDto dto, Guid companyId)
    {
        _logger.LogInformation("Creating test drive for session {SessionId}, company {CompanyId}", dto.SessionId, companyId);
        var testDrive = new TestDrive
        {
            SessionId = dto.SessionId,
            CompanyId = companyId,
            Title = dto.Title,
            Description = dto.Description,
            MileageStart = dto.MileageStart,
            OverallPriority = dto.OverallPriority,
            Status = RequestStatus.Pending
        };

        TestDrives.Add(testDrive);
        await SaveChangesAsync();
        _logger.LogInformation("Created test drive {TestDriveId}", testDrive.Id);

        await UpdateSessionStatus(dto.SessionId, SessionStatus.TestDrive);

        return testDrive.ToDto();
    }

    public async Task<TestDriveDto?> UpdateAsync(Guid id, UpdateTestDriveDto dto, Guid companyId)
    {
        var testDrive = await TestDrives
            .Include(t => t.MediaItems)
            .Where(t => t.Id == id && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (testDrive == null) return null;

        if (dto.Title != null) testDrive.Title = dto.Title;
        if (dto.Description != null) testDrive.Description = dto.Description;
        if (dto.Status.HasValue) testDrive.Status = dto.Status.Value;
        if (dto.DriverId.HasValue) testDrive.DriverId = dto.DriverId.Value;
        if (dto.MileageStart.HasValue) testDrive.MileageStart = dto.MileageStart.Value;
        if (dto.MileageEnd.HasValue) testDrive.MileageEnd = dto.MileageEnd.Value;
        if (dto.RouteDescription != null) testDrive.RouteDescription = dto.RouteDescription;
        if (dto.EnginePerformance != null) testDrive.EnginePerformance = dto.EnginePerformance;
        if (dto.TransmissionPerformance != null) testDrive.TransmissionPerformance = dto.TransmissionPerformance;
        if (dto.BrakePerformance != null) testDrive.BrakePerformance = dto.BrakePerformance;
        if (dto.SteeringPerformance != null) testDrive.SteeringPerformance = dto.SteeringPerformance;
        if (dto.SuspensionPerformance != null) testDrive.SuspensionPerformance = dto.SuspensionPerformance;
        if (dto.NoiseObservations != null) testDrive.NoiseObservations = dto.NoiseObservations;
        if (dto.VibrationObservations != null) testDrive.VibrationObservations = dto.VibrationObservations;
        if (dto.ElectricalObservations != null) testDrive.ElectricalObservations = dto.ElectricalObservations;
        if (dto.AcPerformance != null) testDrive.AcPerformance = dto.AcPerformance;
        if (dto.Findings != null) testDrive.Findings = dto.Findings;
        if (dto.Recommendations != null) testDrive.Recommendations = dto.Recommendations;
        if (dto.OverallPriority.HasValue) testDrive.OverallPriority = dto.OverallPriority.Value;
        if (dto.Notes != null) testDrive.Notes = dto.Notes;

        testDrive.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return testDrive.ToDto();
    }

    public async Task<bool> StartTestDriveAsync(Guid id, Guid driverId, int? mileageStart, Guid companyId)
    {
        var testDrive = await TestDrives
            .Where(t => t.Id == id && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (testDrive == null) return false;

        testDrive.Status = RequestStatus.InProgress;
        testDrive.DriverId = driverId;
        testDrive.StartedAt = DateTime.UtcNow;
        if (mileageStart.HasValue) testDrive.MileageStart = mileageStart.Value;
        testDrive.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> CompleteTestDriveAsync(Guid id, int? mileageEnd, Guid companyId)
    {
        var testDrive = await TestDrives
            .Where(t => t.Id == id && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (testDrive == null) return false;

        testDrive.Status = RequestStatus.Completed;
        testDrive.CompletedAt = DateTime.UtcNow;
        if (mileageEnd.HasValue) testDrive.MileageEnd = mileageEnd.Value;
        testDrive.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var testDrive = await TestDrives
            .Where(t => t.Id == id && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (testDrive == null) return false;

        TestDrives.Remove(testDrive);
        await SaveChangesAsync();
        return true;
    }

    private async Task UpdateSessionStatus(Guid sessionId, SessionStatus status)
    {
        var session = await GarageSessions.FindAsync(sessionId);
        if (session != null && session.Status < status)
        {
            session.Status = status;
            session.UpdatedAt = DateTime.UtcNow;
            await SaveChangesAsync();
        }
    }
}

file static class TestDriveMappingExtensions
{
    public static TestDriveDto ToDto(this TestDrive t) => new(
        Id: t.Id,
        SessionId: t.SessionId,
        Title: t.Title,
        Description: t.Description,
        Status: t.Status,
        DriverId: t.DriverId,
        StartedAt: t.StartedAt,
        CompletedAt: t.CompletedAt,
        MileageStart: t.MileageStart,
        MileageEnd: t.MileageEnd,
        RouteDescription: t.RouteDescription,
        EnginePerformance: t.EnginePerformance,
        TransmissionPerformance: t.TransmissionPerformance,
        BrakePerformance: t.BrakePerformance,
        SteeringPerformance: t.SteeringPerformance,
        SuspensionPerformance: t.SuspensionPerformance,
        NoiseObservations: t.NoiseObservations,
        VibrationObservations: t.VibrationObservations,
        ElectricalObservations: t.ElectricalObservations,
        AcPerformance: t.AcPerformance,
        Findings: t.Findings,
        Recommendations: t.Recommendations,
        OverallPriority: t.OverallPriority,
        MediaItems: t.MediaItems?.Select(m => new MediaItemDto(
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
        )) ?? [],
        CreatedAt: t.CreatedAt
    );
}
