using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Web.Modules.Sessions.DTOs;
using Gixat.Web.Modules.Sessions.Entities;
using Gixat.Web.Modules.Sessions.Enums;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Clients.Entities;
using Gixat.Web.Shared.Pagination;
using Gixat.Web.Shared.Services;

namespace Gixat.Web.Modules.Sessions.Services;

public class SessionService : BaseService, ISessionService
{
    private readonly ILogger<SessionService> _logger;

    public SessionService(DbContext context, ILogger<SessionService> logger) : base(context)
    {
        _logger = logger;
    }

    private DbSet<GarageSession> GarageSessions => Set<GarageSession>();
    private DbSet<CustomerRequest> CustomerRequests => Set<CustomerRequest>();
    private DbSet<Inspection> Inspections => Set<Inspection>();
    private DbSet<TestDrive> TestDrives => Set<TestDrive>();
    private DbSet<JobCard> JobCards => Set<JobCard>();
    private DbSet<Client> Clients => Set<Client>();
    private DbSet<ClientVehicle> ClientVehicles => Set<ClientVehicle>();

    // Projects a pre-filtered session query to DTOs with LEFT JOINs
    private IQueryable<SessionDto> ProjectSessionsToDto(IQueryable<GarageSession> sessions)
    {
        return from s in sessions
               join c in Clients on s.ClientId equals c.Id into clientJoin
               from client in clientJoin.DefaultIfEmpty()
               join v in ClientVehicles on s.ClientVehicleId equals v.Id into vehicleJoin
               from vehicle in vehicleJoin.DefaultIfEmpty()
               select new SessionDto(
                   s.Id,
                   s.SessionNumber,
                   s.Status,
                   s.CompanyId,
                   s.BranchId,
                   s.ClientId,
                   client != null ? client.FirstName + " " + client.LastName : "Unknown Client",
                   s.ClientVehicleId,
                   vehicle != null 
                       ? (vehicle.Year != null ? vehicle.Year.ToString() + " " : "") + vehicle.Make + " " + vehicle.Model
                       : "Unknown Vehicle",
                   vehicle != null ? vehicle.LicensePlate : null,
                   s.MileageIn,
                   s.MileageOut,
                   s.CheckInAt,
                   s.CheckOutAt,
                   s.EstimatedCompletionAt,
                   s.ServiceAdvisorId,
                   s.TechnicianId,
                   s.Notes,
                   CustomerRequests.Any(r => r.SessionId == s.Id),
                   Inspections.Any(i => i.SessionId == s.Id),
                   TestDrives.Any(t => t.SessionId == s.Id),
                   JobCards.Any(j => j.SessionId == s.Id),
                   s.CreatedAt
               );
    }

    // Base session query for a company - filter this BEFORE calling ProjectSessionsToDto
    private IQueryable<GarageSession> GetBaseQuery(Guid companyId)
    {
        return GarageSessions.AsNoTracking().Where(s => s.CompanyId == companyId);
    }

    // Convenience method when no pre-filtering is needed
    private IQueryable<SessionDto> GetSessionQuery(Guid companyId)
    {
        return ProjectSessionsToDto(GetBaseQuery(companyId));
    }

    public async Task<SessionDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        _logger.LogDebug("Getting session {SessionId} for company {CompanyId}", id, companyId);
        
        return await GetSessionQuery(companyId)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<SessionDto?> GetBySessionNumberAsync(string sessionNumber, Guid companyId)
    {
        return await GetSessionQuery(companyId)
            .FirstOrDefaultAsync(s => s.SessionNumber == sessionNumber);
    }

    public async Task<IEnumerable<SessionDto>> GetAllAsync(Guid companyId, SessionStatus? status = null)
    {
        _logger.LogDebug("Getting all sessions for company {CompanyId}, status filter: {Status}", companyId, status);
        
        var baseQuery = GetBaseQuery(companyId);

        if (status.HasValue)
            baseQuery = baseQuery.Where(s => s.Status == status.Value);

        // Apply ordering on entity level before projection
        baseQuery = baseQuery.OrderByDescending(s => s.CheckInAt);

        return await ProjectSessionsToDto(baseQuery).ToListAsync();
    }

    public async Task<PagedResponse<SessionDto>> GetAllPagedAsync(Guid companyId, PagedRequest request, SessionStatus? status = null)
    {
        _logger.LogDebug("Getting paginated sessions for company {CompanyId}, page {Page}, pageSize {PageSize}, status: {Status}", 
            companyId, request.Page, request.PageSize, status);
        
        var baseQuery = GetBaseQuery(companyId);

        if (status.HasValue)
            baseQuery = baseQuery.Where(s => s.Status == status.Value);

        // Apply search filter on entity level
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            baseQuery = baseQuery.Where(s => s.SessionNumber.ToLower().Contains(searchTerm) ||
                (s.Notes != null && s.Notes.ToLower().Contains(searchTerm)));
        }

        var totalCount = await baseQuery.CountAsync();

        // Apply sorting and pagination on entity level
        baseQuery = request.SortDescending
            ? baseQuery.OrderByDescending(s => s.CheckInAt)
            : baseQuery.OrderBy(s => s.CheckInAt);

        baseQuery = baseQuery.Skip(request.Skip).Take(request.PageSize);

        var items = await ProjectSessionsToDto(baseQuery).ToListAsync();

        return PagedResponse<SessionDto>.Create(items, totalCount, request.Page, request.PageSize);
    }

    public async Task<IEnumerable<SessionDto>> GetByClientAsync(Guid clientId, Guid companyId)
    {
        var baseQuery = GetBaseQuery(companyId)
            .Where(s => s.ClientId == clientId)
            .OrderByDescending(s => s.CheckInAt);

        return await ProjectSessionsToDto(baseQuery).ToListAsync();
    }

    public async Task<IEnumerable<SessionDto>> GetByVehicleAsync(Guid vehicleId, Guid companyId)
    {
        var baseQuery = GetBaseQuery(companyId)
            .Where(s => s.ClientVehicleId == vehicleId)
            .OrderByDescending(s => s.CheckInAt);

        return await ProjectSessionsToDto(baseQuery).ToListAsync();
    }

    public async Task<IEnumerable<SessionDto>> GetActiveSessionsAsync(Guid companyId)
    {
        var activeStatuses = new[]
        {
            SessionStatus.CheckedIn,
            SessionStatus.CustomerRequest,
            SessionStatus.Inspection,
            SessionStatus.TestDrive,
            SessionStatus.AwaitingApproval,
            SessionStatus.InProgress,
            SessionStatus.Completed,
            SessionStatus.ReadyForPickup
        };

        var baseQuery = GetBaseQuery(companyId)
            .Where(s => activeStatuses.Contains(s.Status))
            .OrderByDescending(s => s.CheckInAt);

        return await ProjectSessionsToDto(baseQuery).ToListAsync();
    }

    public async Task<SessionDto> CreateAsync(CreateSessionDto dto)
    {
        _logger.LogInformation("Creating new session for company {CompanyId}, client {ClientId}", dto.CompanyId, dto.ClientId);
        
        var sessionNumber = await GenerateSessionNumberAsync(dto.CompanyId);

        var session = new GarageSession
        {
            CompanyId = dto.CompanyId,
            BranchId = dto.BranchId,
            ClientId = dto.ClientId,
            ClientVehicleId = dto.ClientVehicleId,
            SessionNumber = sessionNumber,
            Status = SessionStatus.CheckedIn,
            MileageIn = dto.MileageIn,
            EstimatedCompletionAt = dto.EstimatedCompletionAt,
            ServiceAdvisorId = dto.ServiceAdvisorId,
            Notes = dto.Notes,
            CheckInAt = DateTime.UtcNow
        };

        GarageSessions.Add(session);
        await SaveChangesAsync();

        _logger.LogInformation("Created session {SessionNumber} with ID {SessionId}", sessionNumber, session.Id);
        return await MapToDto(session);
    }

    public async Task<SessionDto?> UpdateAsync(Guid id, UpdateSessionDto dto, Guid companyId)
    {
        var session = await GarageSessions
            .Where(s => s.Id == id && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null)
        {
            _logger.LogWarning("Session {SessionId} not found for update", id);
            return null;
        }

        if (dto.Status.HasValue) session.Status = dto.Status.Value;
        if (dto.MileageIn.HasValue) session.MileageIn = dto.MileageIn.Value;
        if (dto.MileageOut.HasValue) session.MileageOut = dto.MileageOut.Value;
        if (dto.EstimatedCompletionAt.HasValue) session.EstimatedCompletionAt = dto.EstimatedCompletionAt.Value;
        if (dto.ServiceAdvisorId.HasValue) session.ServiceAdvisorId = dto.ServiceAdvisorId.Value;
        if (dto.TechnicianId.HasValue) session.TechnicianId = dto.TechnicianId.Value;
        if (dto.Notes != null) session.Notes = dto.Notes;
        if (dto.InternalNotes != null) session.InternalNotes = dto.InternalNotes;

        session.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        _logger.LogInformation("Updated session {SessionId}", id);
        return await MapToDto(session);
    }

    public async Task<bool> UpdateStatusAsync(Guid id, SessionStatus status, Guid companyId)
    {
        var session = await GarageSessions
            .Where(s => s.Id == id && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null) return false;

        var oldStatus = session.Status;
        session.Status = status;
        session.UpdatedAt = DateTime.UtcNow;

        if (status == SessionStatus.Closed && !session.CheckOutAt.HasValue)
        {
            session.CheckOutAt = DateTime.UtcNow;
        }

        await SaveChangesAsync();
        _logger.LogInformation("Session {SessionId} status changed from {OldStatus} to {NewStatus}", id, oldStatus, status);
        return true;
    }

    public async Task<bool> CheckOutAsync(Guid id, int? mileageOut, Guid companyId)
    {
        var session = await GarageSessions
            .Where(s => s.Id == id && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null) return false;

        session.Status = SessionStatus.Closed;
        session.MileageOut = mileageOut;
        session.CheckOutAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;

        await SaveChangesAsync();
        _logger.LogInformation("Session {SessionId} checked out with mileage {MileageOut}", id, mileageOut);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid companyId)
    {
        var session = await GarageSessions
            .Where(s => s.Id == id && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (session == null) return false;

        GarageSessions.Remove(session);
        await SaveChangesAsync();
        _logger.LogInformation("Deleted session {SessionId}", id);
        return true;
    }

    public async Task<string> GenerateSessionNumberAsync(Guid companyId)
    {
        var today = DateTime.UtcNow;
        var prefix = $"SES-{today:yyyyMMdd}-";

        var lastSession = await GarageSessions
            .Where(s => s.CompanyId == companyId && s.SessionNumber.StartsWith(prefix))
            .OrderByDescending(s => s.SessionNumber)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastSession != null)
        {
            var lastNumberStr = lastSession.SessionNumber.Replace(prefix, "");
            if (int.TryParse(lastNumberStr, out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{prefix}{nextNumber:D4}";
    }

    public async Task<IEnumerable<SessionDto>> SearchAsync(Guid companyId, string searchTerm)
    {
        var term = searchTerm.ToLower();

        return await GetSessionQuery(companyId)
            .Where(s => s.SessionNumber.ToLower().Contains(term) ||
                 (s.Notes != null && s.Notes.ToLower().Contains(term)))
            .OrderByDescending(s => s.CheckInAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<SessionStatsDto> GetSessionStatsAsync(Guid companyId)
    {
        var today = DateTime.UtcNow.Date;
        var activeStatuses = new[]
        {
            SessionStatus.CheckedIn,
            SessionStatus.CustomerRequest,
            SessionStatus.Inspection,
            SessionStatus.TestDrive,
            SessionStatus.AwaitingApproval,
            SessionStatus.InProgress,
            SessionStatus.Completed,
            SessionStatus.ReadyForPickup
        };

        var stats = await GarageSessions
            .Where(s => s.CompanyId == companyId)
            .GroupBy(s => 1)
            .Select(g => new SessionStatsDto
            {
                ActiveSessions = g.Count(s => activeStatuses.Contains(s.Status)),
                TodaySessions = g.Count(s => s.CheckInAt.Date == today),
                InProgressSessions = g.Count(s => s.Status == SessionStatus.InProgress),
                AwaitingPickup = g.Count(s => s.Status == SessionStatus.ReadyForPickup)
            })
            .FirstOrDefaultAsync();

        return stats ?? new SessionStatsDto();
    }

    public async Task<IEnumerable<SessionDto>> GetRecentSessionsAsync(Guid companyId, int count)
    {
        var baseQuery = GetBaseQuery(companyId)
            .OrderByDescending(s => s.CheckInAt)
            .Take(count);

        return await ProjectSessionsToDto(baseQuery).ToListAsync();
    }

    private async Task<SessionDto> MapToDto(GarageSession session)
    {
        // This method is now only used for Create/Update where we have the entity in memory
        // and want to return a DTO. For bulk reads, use GetSessionQuery projection.
        
        // Check for related entities
        var hasCustomerRequest = await CustomerRequests.AnyAsync(r => r.SessionId == session.Id);
        var hasInspection = await Inspections.AnyAsync(i => i.SessionId == session.Id);
        var hasTestDrive = await TestDrives.AnyAsync(t => t.SessionId == session.Id);
        var hasJobCard = await JobCards.AnyAsync(j => j.SessionId == session.Id);

        // Fetch client and vehicle data
        var client = await Clients
            .AsNoTracking()
            .Where(c => c.Id == session.ClientId)
            .FirstOrDefaultAsync();

        var vehicle = await ClientVehicles
            .AsNoTracking()
            .Where(v => v.Id == session.ClientVehicleId)
            .FirstOrDefaultAsync();

        return new SessionDto(
            Id: session.Id,
            SessionNumber: session.SessionNumber,
            Status: session.Status,
            CompanyId: session.CompanyId,
            BranchId: session.BranchId,
            ClientId: session.ClientId,
            ClientName: client?.FullName ?? "Unknown Client",
            ClientVehicleId: session.ClientVehicleId,
            VehicleDisplayName: vehicle?.DisplayName ?? "Unknown Vehicle",
            VehicleLicensePlate: vehicle?.LicensePlate,
            MileageIn: session.MileageIn,
            MileageOut: session.MileageOut,
            CheckInAt: session.CheckInAt,
            CheckOutAt: session.CheckOutAt,
            EstimatedCompletionAt: session.EstimatedCompletionAt,
            ServiceAdvisorId: session.ServiceAdvisorId,
            TechnicianId: session.TechnicianId,
            Notes: session.Notes,
            HasCustomerRequest: hasCustomerRequest,
            HasInspection: hasInspection,
            HasTestDrive: hasTestDrive,
            HasJobCard: hasJobCard,
            CreatedAt: session.CreatedAt
        );
    }
}
