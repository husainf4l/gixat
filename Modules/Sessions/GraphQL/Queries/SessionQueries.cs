using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Authorization;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Sessions.Interfaces;

namespace Gixat.Web.Modules.Sessions.GraphQL.Queries;

[ExtendObjectType("Query")]
public class SessionQueries
{
    [Authorize]
    public async Task<SessionDto?> GetSession(
        [Service] ISessionService sessionService,
        Guid id,
        Guid companyId)
    {
        return await sessionService.GetByIdAsync(id, companyId);
    }

    [Authorize]
    public async Task<SessionDto?> GetSessionByNumber(
        [Service] ISessionService sessionService,
        string sessionNumber,
        Guid companyId)
    {
        return await sessionService.GetBySessionNumberAsync(sessionNumber, companyId);
    }

    [Authorize]
    public async Task<IEnumerable<SessionDto>> GetSessions(
        [Service] ISessionService sessionService,
        Guid companyId,
        SessionStatus? status = null)
    {
        return await sessionService.GetAllAsync(companyId, status);
    }

    [Authorize]
    public async Task<IEnumerable<SessionDto>> GetActiveSessions(
        [Service] ISessionService sessionService,
        Guid companyId)
    {
        return await sessionService.GetActiveSessionsAsync(companyId);
    }

    [Authorize]
    public async Task<IEnumerable<SessionDto>> GetSessionsByClient(
        [Service] ISessionService sessionService,
        Guid clientId,
        Guid companyId)
    {
        return await sessionService.GetByClientAsync(clientId, companyId);
    }

    [Authorize]
    public async Task<IEnumerable<SessionDto>> GetSessionsByVehicle(
        [Service] ISessionService sessionService,
        Guid vehicleId,
        Guid companyId)
    {
        return await sessionService.GetByVehicleAsync(vehicleId, companyId);
    }

    [Authorize]
    public async Task<IEnumerable<SessionDto>> SearchSessions(
        [Service] ISessionService sessionService,
        Guid companyId,
        string searchTerm)
    {
        return await sessionService.SearchAsync(companyId, searchTerm);
    }

    // Customer Request
    [Authorize]
    public async Task<CustomerRequestDto?> GetCustomerRequest(
        [Service] ICustomerRequestService service,
        Guid id,
        Guid companyId)
    {
        return await service.GetByIdAsync(id, companyId);
    }

    [Authorize]
    public async Task<CustomerRequestDto?> GetCustomerRequestBySession(
        [Service] ICustomerRequestService service,
        Guid sessionId,
        Guid companyId)
    {
        return await service.GetBySessionIdAsync(sessionId, companyId);
    }

    // Inspection
    [Authorize]
    public async Task<InspectionDto?> GetInspection(
        [Service] IInspectionService service,
        Guid id,
        Guid companyId)
    {
        return await service.GetByIdAsync(id, companyId);
    }

    [Authorize]
    public async Task<InspectionDto?> GetInspectionBySession(
        [Service] IInspectionService service,
        Guid sessionId,
        Guid companyId)
    {
        return await service.GetBySessionIdAsync(sessionId, companyId);
    }

    // Test Drive
    [Authorize]
    public async Task<TestDriveDto?> GetTestDrive(
        [Service] ITestDriveService service,
        Guid id,
        Guid companyId)
    {
        return await service.GetByIdAsync(id, companyId);
    }

    [Authorize]
    public async Task<TestDriveDto?> GetTestDriveBySession(
        [Service] ITestDriveService service,
        Guid sessionId,
        Guid companyId)
    {
        return await service.GetBySessionIdAsync(sessionId, companyId);
    }

    // Job Card
    [Authorize]
    public async Task<JobCardDto?> GetJobCard(
        [Service] IJobCardService service,
        Guid id,
        Guid companyId)
    {
        return await service.GetByIdAsync(id, companyId);
    }

    [Authorize]
    public async Task<JobCardDto?> GetJobCardBySession(
        [Service] IJobCardService service,
        Guid sessionId,
        Guid companyId)
    {
        return await service.GetBySessionIdAsync(sessionId, companyId);
    }

    [Authorize]
    public async Task<JobCardDto?> GetJobCardByNumber(
        [Service] IJobCardService service,
        string jobCardNumber,
        Guid companyId)
    {
        return await service.GetByJobCardNumberAsync(jobCardNumber, companyId);
    }

    [Authorize]
    public async Task<IEnumerable<JobCardDto>> GetJobCards(
        [Service] IJobCardService service,
        Guid companyId,
        JobCardStatus? status = null)
    {
        return await service.GetAllAsync(companyId, status);
    }

    // Reports
    [Authorize]
    public async Task<InitialReportDto?> GetInitialReport(
        [Service] IReportService service,
        Guid sessionId,
        Guid companyId,
        string generatedBy)
    {
        return await service.GenerateInitialReportAsync(sessionId, companyId, generatedBy);
    }

    [Authorize]
    public async Task<FinalReportDto?> GetFinalReport(
        [Service] IReportService service,
        Guid sessionId,
        Guid companyId,
        string generatedBy)
    {
        return await service.GenerateFinalReportAsync(sessionId, companyId, generatedBy);
    }

    // Media
    [Authorize]
    public async Task<IEnumerable<MediaItemDto>> GetSessionMedia(
        [Service] IMediaService service,
        Guid sessionId,
        Guid companyId)
    {
        return await service.GetBySessionIdAsync(sessionId, companyId);
    }

    [Authorize]
    public async Task<MediaDownloadUrlDto?> GetMediaDownloadUrl(
        [Service] IMediaService service,
        Guid mediaId,
        Guid companyId)
    {
        return await service.GetDownloadUrlAsync(mediaId, companyId);
    }
}
