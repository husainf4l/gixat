using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;

namespace Gixat.Modules.Sessions.Interfaces;

public interface ISessionService
{
    // Session CRUD
    Task<SessionDto?> GetByIdAsync(Guid id, Guid companyId);
    Task<SessionDto?> GetBySessionNumberAsync(string sessionNumber, Guid companyId);
    Task<IEnumerable<SessionDto>> GetAllAsync(Guid companyId, SessionStatus? status = null);
    Task<IEnumerable<SessionDto>> GetByClientAsync(Guid clientId, Guid companyId);
    Task<IEnumerable<SessionDto>> GetByVehicleAsync(Guid vehicleId, Guid companyId);
    Task<IEnumerable<SessionDto>> GetActiveSessionsAsync(Guid companyId);
    Task<SessionDto> CreateAsync(CreateSessionDto dto);
    Task<SessionDto?> UpdateAsync(Guid id, UpdateSessionDto dto, Guid companyId);
    Task<bool> UpdateStatusAsync(Guid id, SessionStatus status, Guid companyId);
    Task<bool> CheckOutAsync(Guid id, int? mileageOut, Guid companyId);
    Task<bool> DeleteAsync(Guid id, Guid companyId);
    
    // Session number generation
    Task<string> GenerateSessionNumberAsync(Guid companyId);
    
    // Search
    Task<IEnumerable<SessionDto>> SearchAsync(Guid companyId, string searchTerm);
}

public interface ICustomerRequestService
{
    Task<CustomerRequestDto?> GetByIdAsync(Guid id, Guid companyId);
    Task<CustomerRequestDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId);
    Task<CustomerRequestDto> CreateAsync(CreateCustomerRequestDto dto, Guid companyId);
    Task<CustomerRequestDto?> UpdateAsync(Guid id, UpdateCustomerRequestDto dto, Guid companyId);
    Task<bool> CompleteAsync(Guid id, Guid completedById, Guid companyId);
    Task<bool> DeleteAsync(Guid id, Guid companyId);
}

public interface IInspectionService
{
    Task<InspectionDto?> GetByIdAsync(Guid id, Guid companyId);
    Task<InspectionDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId);
    Task<InspectionDto> CreateAsync(CreateInspectionDto dto, Guid companyId);
    Task<InspectionDto?> UpdateAsync(Guid id, UpdateInspectionDto dto, Guid companyId);
    Task<bool> StartInspectionAsync(Guid id, Guid inspectorId, Guid companyId);
    Task<bool> CompleteInspectionAsync(Guid id, Guid companyId);
    Task<bool> DeleteAsync(Guid id, Guid companyId);
    
    // Inspection Items
    Task<InspectionItemDto> AddItemAsync(CreateInspectionItemDto dto);
    Task<bool> UpdateItemAsync(Guid itemId, string? condition, string? notes, Priority? priority, bool? requiresAttention);
    Task<bool> RemoveItemAsync(Guid itemId);
}

public interface ITestDriveService
{
    Task<TestDriveDto?> GetByIdAsync(Guid id, Guid companyId);
    Task<TestDriveDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId);
    Task<TestDriveDto> CreateAsync(CreateTestDriveDto dto, Guid companyId);
    Task<TestDriveDto?> UpdateAsync(Guid id, UpdateTestDriveDto dto, Guid companyId);
    Task<bool> StartTestDriveAsync(Guid id, Guid driverId, int? mileageStart, Guid companyId);
    Task<bool> CompleteTestDriveAsync(Guid id, int? mileageEnd, Guid companyId);
    Task<bool> DeleteAsync(Guid id, Guid companyId);
}

public interface IJobCardService
{
    Task<JobCardDto?> GetByIdAsync(Guid id, Guid companyId);
    Task<JobCardDto?> GetBySessionIdAsync(Guid sessionId, Guid companyId);
    Task<JobCardDto?> GetByJobCardNumberAsync(string jobCardNumber, Guid companyId);
    Task<IEnumerable<JobCardDto>> GetAllAsync(Guid companyId, JobCardStatus? status = null);
    Task<JobCardDto> CreateAsync(CreateJobCardDto dto, Guid companyId);
    Task<JobCardDto?> UpdateAsync(Guid id, UpdateJobCardDto dto, Guid companyId);
    Task<bool> ApproveAsync(Guid id, Guid approvedById, string? notes, Guid companyId);
    Task<bool> AuthorizeAsync(Guid id, string method, string? notes, Guid companyId);
    Task<bool> StartWorkAsync(Guid id, Guid companyId);
    Task<bool> CompleteWorkAsync(Guid id, Guid companyId);
    Task<bool> DeleteAsync(Guid id, Guid companyId);
    
    // Job Card Number generation
    Task<string> GenerateJobCardNumberAsync(Guid companyId);
    
    // Job Card Items
    Task<JobCardItemDto> AddItemAsync(CreateJobCardItemDto dto, Guid companyId);
    Task<JobCardItemDto?> UpdateItemAsync(Guid itemId, UpdateJobCardItemDto dto, Guid companyId);
    Task<bool> StartItemAsync(Guid itemId, Guid technicianId, Guid companyId);
    Task<bool> CompleteItemAsync(Guid itemId, string? workPerformed, string? technicianNotes, decimal? actualHours, Guid companyId);
    Task<bool> QualityCheckItemAsync(Guid itemId, Guid checkedById, string? notes, Guid companyId);
    Task<bool> RemoveItemAsync(Guid itemId, Guid companyId);
    
    // Create items from sources
    Task<JobCardItemDto> CreateItemFromCustomerRequestAsync(Guid jobCardId, Guid customerRequestId, string title, string? description, Guid companyId);
    Task<JobCardItemDto> CreateItemFromInspectionAsync(Guid jobCardId, Guid inspectionItemId, string title, string? description, Guid companyId);
    Task<JobCardItemDto> CreateItemFromTestDriveAsync(Guid jobCardId, Guid testDriveId, string title, string? description, Guid companyId);
}

public interface IReportService
{
    Task<InitialReportDto?> GenerateInitialReportAsync(Guid sessionId, Guid companyId, string generatedBy);
    Task<FinalReportDto?> GenerateFinalReportAsync(Guid sessionId, Guid companyId, string generatedBy);
}
