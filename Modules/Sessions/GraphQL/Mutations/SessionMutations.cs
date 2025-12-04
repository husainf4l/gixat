using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Authorization;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Sessions.Interfaces;

namespace Gixat.Web.Modules.Sessions.GraphQL.Mutations;

[ExtendObjectType("Mutation")]
public class SessionMutations
{
    // Session Mutations
    [Authorize]
    public async Task<SessionDto> CreateSession(
        [Service] ISessionService sessionService,
        CreateSessionDto input)
    {
        return await sessionService.CreateAsync(input);
    }

    [Authorize]
    public async Task<SessionDto?> UpdateSession(
        [Service] ISessionService sessionService,
        Guid id,
        UpdateSessionDto input,
        Guid companyId)
    {
        return await sessionService.UpdateAsync(id, input, companyId);
    }

    [Authorize]
    public async Task<bool> UpdateSessionStatus(
        [Service] ISessionService sessionService,
        Guid id,
        SessionStatus status,
        Guid companyId)
    {
        return await sessionService.UpdateStatusAsync(id, status, companyId);
    }

    [Authorize]
    public async Task<bool> CheckOutSession(
        [Service] ISessionService sessionService,
        Guid id,
        int? mileageOut,
        Guid companyId)
    {
        return await sessionService.CheckOutAsync(id, mileageOut, companyId);
    }

    [Authorize]
    public async Task<bool> DeleteSession(
        [Service] ISessionService sessionService,
        Guid id,
        Guid companyId)
    {
        return await sessionService.DeleteAsync(id, companyId);
    }

    // Customer Request Mutations
    [Authorize]
    public async Task<CustomerRequestDto> CreateCustomerRequest(
        [Service] ICustomerRequestService service,
        CreateCustomerRequestDto input,
        Guid companyId)
    {
        return await service.CreateAsync(input, companyId);
    }

    [Authorize]
    public async Task<CustomerRequestDto?> UpdateCustomerRequest(
        [Service] ICustomerRequestService service,
        Guid id,
        UpdateCustomerRequestDto input,
        Guid companyId)
    {
        return await service.UpdateAsync(id, input, companyId);
    }

    [Authorize]
    public async Task<bool> CompleteCustomerRequest(
        [Service] ICustomerRequestService service,
        Guid id,
        Guid completedById,
        Guid companyId)
    {
        return await service.CompleteAsync(id, completedById, companyId);
    }

    // Inspection Mutations
    [Authorize]
    public async Task<InspectionDto> CreateInspection(
        [Service] IInspectionService service,
        CreateInspectionDto input,
        Guid companyId)
    {
        return await service.CreateAsync(input, companyId);
    }

    [Authorize]
    public async Task<InspectionDto?> UpdateInspection(
        [Service] IInspectionService service,
        Guid id,
        UpdateInspectionDto input,
        Guid companyId)
    {
        return await service.UpdateAsync(id, input, companyId);
    }

    [Authorize]
    public async Task<bool> StartInspection(
        [Service] IInspectionService service,
        Guid id,
        Guid inspectorId,
        Guid companyId)
    {
        return await service.StartInspectionAsync(id, inspectorId, companyId);
    }

    [Authorize]
    public async Task<bool> CompleteInspection(
        [Service] IInspectionService service,
        Guid id,
        Guid companyId)
    {
        return await service.CompleteInspectionAsync(id, companyId);
    }

    [Authorize]
    public async Task<InspectionItemDto> AddInspectionItem(
        [Service] IInspectionService service,
        CreateInspectionItemDto input)
    {
        return await service.AddItemAsync(input);
    }

    [Authorize]
    public async Task<bool> UpdateInspectionItem(
        [Service] IInspectionService service,
        Guid itemId,
        string? condition,
        string? notes,
        Priority? priority,
        bool? requiresAttention)
    {
        return await service.UpdateItemAsync(itemId, condition, notes, priority, requiresAttention);
    }

    // Test Drive Mutations
    [Authorize]
    public async Task<TestDriveDto> CreateTestDrive(
        [Service] ITestDriveService service,
        CreateTestDriveDto input,
        Guid companyId)
    {
        return await service.CreateAsync(input, companyId);
    }

    [Authorize]
    public async Task<TestDriveDto?> UpdateTestDrive(
        [Service] ITestDriveService service,
        Guid id,
        UpdateTestDriveDto input,
        Guid companyId)
    {
        return await service.UpdateAsync(id, input, companyId);
    }

    [Authorize]
    public async Task<bool> StartTestDrive(
        [Service] ITestDriveService service,
        Guid id,
        Guid driverId,
        int? mileageStart,
        Guid companyId)
    {
        return await service.StartTestDriveAsync(id, driverId, mileageStart, companyId);
    }

    [Authorize]
    public async Task<bool> CompleteTestDrive(
        [Service] ITestDriveService service,
        Guid id,
        int? mileageEnd,
        Guid companyId)
    {
        return await service.CompleteTestDriveAsync(id, mileageEnd, companyId);
    }

    // Job Card Mutations
    [Authorize]
    public async Task<JobCardDto> CreateJobCard(
        [Service] IJobCardService service,
        CreateJobCardDto input,
        Guid companyId)
    {
        return await service.CreateAsync(input, companyId);
    }

    [Authorize]
    public async Task<JobCardDto?> UpdateJobCard(
        [Service] IJobCardService service,
        Guid id,
        UpdateJobCardDto input,
        Guid companyId)
    {
        return await service.UpdateAsync(id, input, companyId);
    }

    [Authorize]
    public async Task<bool> ApproveJobCard(
        [Service] IJobCardService service,
        Guid id,
        Guid approvedById,
        string? notes,
        Guid companyId)
    {
        return await service.ApproveAsync(id, approvedById, notes, companyId);
    }

    [Authorize]
    public async Task<bool> AuthorizeJobCard(
        [Service] IJobCardService service,
        Guid id,
        string method,
        string? notes,
        Guid companyId)
    {
        return await service.AuthorizeAsync(id, method, notes, companyId);
    }

    [Authorize]
    public async Task<bool> StartJobCardWork(
        [Service] IJobCardService service,
        Guid id,
        Guid companyId)
    {
        return await service.StartWorkAsync(id, companyId);
    }

    [Authorize]
    public async Task<bool> CompleteJobCardWork(
        [Service] IJobCardService service,
        Guid id,
        Guid companyId)
    {
        return await service.CompleteWorkAsync(id, companyId);
    }

    [Authorize]
    public async Task<JobCardItemDto> AddJobCardItem(
        [Service] IJobCardService service,
        CreateJobCardItemDto input,
        Guid companyId)
    {
        return await service.AddItemAsync(input, companyId);
    }

    [Authorize]
    public async Task<JobCardItemDto?> UpdateJobCardItem(
        [Service] IJobCardService service,
        Guid itemId,
        UpdateJobCardItemDto input,
        Guid companyId)
    {
        return await service.UpdateItemAsync(itemId, input, companyId);
    }

    [Authorize]
    public async Task<bool> StartJobCardItem(
        [Service] IJobCardService service,
        Guid itemId,
        Guid technicianId,
        Guid companyId)
    {
        return await service.StartItemAsync(itemId, technicianId, companyId);
    }

    [Authorize]
    public async Task<bool> CompleteJobCardItem(
        [Service] IJobCardService service,
        Guid itemId,
        string? workPerformed,
        string? technicianNotes,
        decimal? actualHours,
        Guid companyId)
    {
        return await service.CompleteItemAsync(itemId, workPerformed, technicianNotes, actualHours, companyId);
    }

    [Authorize]
    public async Task<bool> QualityCheckJobCardItem(
        [Service] IJobCardService service,
        Guid itemId,
        Guid checkedById,
        string? notes,
        Guid companyId)
    {
        return await service.QualityCheckItemAsync(itemId, checkedById, notes, companyId);
    }

    // Media Mutations
    [Authorize]
    public async Task<MediaUploadUrlDto> CreateMediaUploadUrl(
        [Service] IMediaService service,
        CreateMediaItemDto input,
        Guid companyId)
    {
        return await service.CreateUploadUrlAsync(input, companyId);
    }

    [Authorize]
    public async Task<MediaItemDto?> ConfirmMediaUpload(
        [Service] IMediaService service,
        Guid mediaItemId,
        Guid companyId)
    {
        return await service.ConfirmUploadAsync(mediaItemId, companyId);
    }

    [Authorize]
    public async Task<MediaItemDto?> UpdateMediaItem(
        [Service] IMediaService service,
        Guid id,
        string? title,
        string? description,
        string? tags,
        int? sortOrder,
        Guid companyId)
    {
        return await service.UpdateAsync(id, title, description, tags, sortOrder, companyId);
    }

    [Authorize]
    public async Task<bool> DeleteMediaItem(
        [Service] IMediaService service,
        Guid id,
        Guid companyId)
    {
        return await service.DeleteAsync(id, companyId);
    }
}
