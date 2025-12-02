using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;

namespace Gixat.Modules.Sessions.Services;

public class TestDriveService : ITestDriveService
{
    private readonly DbContext _context;

    public TestDriveService(DbContext context)
    {
        _context = context;
    }

    private DbSet<TestDrive> TestDrives => _context.Set<TestDrive>();
    private DbSet<GarageSession> GarageSessions => _context.Set<GarageSession>();

    public async Task<TestDriveDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.Id == id && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return testDrive == null ? null : MapToDto(testDrive);
    }

    public async Task<TestDriveDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId)
    {
        var testDrive = await TestDrives
            .AsNoTracking()
            .Include(t => t.MediaItems)
            .Where(t => t.SessionId == sessionId && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return testDrive == null ? null : MapToDto(testDrive);
    }

    public async Task<TestDriveDto> CreateAsync(CreateTestDriveDto dto, Guid companyId)
    {
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
        await _context.SaveChangesAsync();

        // Update session status
        await UpdateSessionStatus(dto.SessionId, SessionStatus.TestDrive);

        return MapToDto(testDrive);
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

        await _context.SaveChangesAsync();
        return MapToDto(testDrive);
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

        await _context.SaveChangesAsync();
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

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var testDrive = await TestDrives
            .Where(t => t.Id == id && t.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (testDrive == null) return false;

        TestDrives.Remove(testDrive);
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

    private static TestDriveDto MapToDto(TestDrive testDrive)
    {
        return new TestDriveDto(
            Id: testDrive.Id,
            SessionId: testDrive.SessionId,
            Title: testDrive.Title,
            Description: testDrive.Description,
            Status: testDrive.Status,
            DriverId: testDrive.DriverId,
            StartedAt: testDrive.StartedAt,
            CompletedAt: testDrive.CompletedAt,
            MileageStart: testDrive.MileageStart,
            MileageEnd: testDrive.MileageEnd,
            RouteDescription: testDrive.RouteDescription,
            EnginePerformance: testDrive.EnginePerformance,
            TransmissionPerformance: testDrive.TransmissionPerformance,
            BrakePerformance: testDrive.BrakePerformance,
            SteeringPerformance: testDrive.SteeringPerformance,
            SuspensionPerformance: testDrive.SuspensionPerformance,
            NoiseObservations: testDrive.NoiseObservations,
            VibrationObservations: testDrive.VibrationObservations,
            ElectricalObservations: testDrive.ElectricalObservations,
            AcPerformance: testDrive.AcPerformance,
            Findings: testDrive.Findings,
            Recommendations: testDrive.Recommendations,
            OverallPriority: testDrive.OverallPriority,
            MediaItems: testDrive.MediaItems?.Select(m => new MediaItemDto(
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
            CreatedAt: testDrive.CreatedAt
        );
    }
}
