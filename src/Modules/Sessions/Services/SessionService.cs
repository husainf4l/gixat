using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Clients.Entities;
using Gixat.Shared.Services;

namespace Gixat.Modules.Sessions.Services;

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

    public async Task<SessionDto?> GetByIdAsync(Guid id, Guid companyId)
    {
        _logger.LogDebug("Getting session {SessionId} for company {CompanyId}", id, companyId);
        
        var session = await GarageSessions
            .AsNoTracking()
            .Where(s => s.Id == id && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return session == null ? null : await MapToDto(session);
    }

    public async Task<SessionDto?> GetBySessionNumberAsync(string sessionNumber, Guid companyId)
    {
        var session = await GarageSessions
            .AsNoTracking()
            .Where(s => s.SessionNumber == sessionNumber && s.CompanyId == companyId)
            .FirstOrDefaultAsync();

        return session == null ? null : await MapToDto(session);
    }

    public async Task<IEnumerable<SessionDto>> GetAllAsync(Guid companyId, SessionStatus? status = null)
    {
        _logger.LogDebug("Getting all sessions for company {CompanyId}, status filter: {Status}", companyId, status);
        
        var query = GarageSessions
            .AsNoTracking()
            .Where(s => s.CompanyId == companyId);

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        var sessions = await query
            .OrderByDescending(s => s.CheckInAt)
            .ToListAsync();

        var results = new List<SessionDto>();
        foreach (var session in sessions)
        {
            results.Add(await MapToDto(session));
        }
        return results;
    }

    public async Task<IEnumerable<SessionDto>> GetByClientAsync(Guid clientId, Guid companyId)
    {
        var sessions = await GarageSessions
            .AsNoTracking()
            .Where(s => s.ClientId == clientId && s.CompanyId == companyId)
            .OrderByDescending(s => s.CheckInAt)
            .ToListAsync();

        var results = new List<SessionDto>();
        foreach (var session in sessions)
        {
            results.Add(await MapToDto(session));
        }
        return results;
    }

    public async Task<IEnumerable<SessionDto>> GetByVehicleAsync(Guid vehicleId, Guid companyId)
    {
        var sessions = await GarageSessions
            .AsNoTracking()
            .Where(s => s.ClientVehicleId == vehicleId && s.CompanyId == companyId)
            .OrderByDescending(s => s.CheckInAt)
            .ToListAsync();

        var results = new List<SessionDto>();
        foreach (var session in sessions)
        {
            results.Add(await MapToDto(session));
        }
        return results;
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

        var sessions = await GarageSessions
            .AsNoTracking()
            .Where(s => s.CompanyId == companyId && activeStatuses.Contains(s.Status))
            .OrderByDescending(s => s.CheckInAt)
            .ToListAsync();

        var results = new List<SessionDto>();
        foreach (var session in sessions)
        {
            results.Add(await MapToDto(session));
        }
        return results;
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

        var sessions = await GarageSessions
            .AsNoTracking()
            .Where(s => s.CompanyId == companyId &&
                (s.SessionNumber.ToLower().Contains(term) ||
                 (s.Notes != null && s.Notes.ToLower().Contains(term))))
            .OrderByDescending(s => s.CheckInAt)
            .Take(50)
            .ToListAsync();

        var results = new List<SessionDto>();
        foreach (var session in sessions)
        {
            results.Add(await MapToDto(session));
        }
        return results;
    }

    private async Task<SessionDto> MapToDto(GarageSession session)
    {
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
