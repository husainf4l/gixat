using Microsoft.Extensions.Logging;
using Moq;
using Gixat.Modules.Sessions.Entities;
using Gixat.Modules.Sessions.Services;
using Gixat.Modules.Sessions.DTOs;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Clients.Entities;
using Gixat.Shared.Pagination;

namespace Gixat.Tests.Services;

public class SessionServiceTests
{
    private readonly TestDbContext _context;
    private readonly SessionService _service;
    private readonly Guid _testCompanyId = Guid.NewGuid();
    private readonly Guid _testBranchId = Guid.NewGuid();
    private readonly Guid _testClientId = Guid.NewGuid();
    private readonly Guid _testVehicleId = Guid.NewGuid();

    public SessionServiceTests()
    {
        _context = TestDbContext.CreateInMemory();
        var logger = new Mock<ILogger<SessionService>>();
        _service = new SessionService(_context, logger.Object);

        // Seed test client and vehicle
        SeedTestData();
    }

    private void SeedTestData()
    {
        var client = new Client
        {
            Id = _testClientId,
            FirstName = "Test",
            LastName = "Client",
            Phone = "1234567890",
            CompanyId = _testCompanyId
        };
        _context.Clients.Add(client);

        var vehicle = new ClientVehicle
        {
            Id = _testVehicleId,
            ClientId = _testClientId,
            Make = "Toyota",
            Model = "Camry",
            Year = 2022,
            LicensePlate = "ABC-123"
        };
        _context.ClientVehicles.Add(vehicle);
        _context.SaveChanges();
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateSession()
    {
        // Arrange
        var dto = new CreateSessionDto(
            CompanyId: _testCompanyId,
            BranchId: _testBranchId,
            ClientId: _testClientId,
            ClientVehicleId: _testVehicleId,
            MileageIn: 50000,
            EstimatedCompletionAt: DateTime.UtcNow.AddDays(1),
            ServiceAdvisorId: null,
            Notes: "Test session"
        );

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.StartsWith("SES-", result.SessionNumber);
        Assert.Equal(SessionStatus.CheckedIn, result.Status);
        Assert.Equal(50000, result.MileageIn);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnSession_WhenExists()
    {
        // Arrange
        var dto = new CreateSessionDto(
            CompanyId: _testCompanyId,
            BranchId: _testBranchId,
            ClientId: _testClientId,
            ClientVehicleId: _testVehicleId,
            MileageIn: 10000,
            EstimatedCompletionAt: null,
            ServiceAdvisorId: null,
            Notes: null
        );
        var created = await _service.CreateAsync(dto);

        // Act
        var result = await _service.GetByIdAsync(created.Id, _testCompanyId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(created.Id, result.Id);
        Assert.Equal(created.SessionNumber, result.SessionNumber);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenWrongCompany()
    {
        // Arrange
        var dto = new CreateSessionDto(
            CompanyId: _testCompanyId,
            BranchId: _testBranchId,
            ClientId: _testClientId,
            ClientVehicleId: _testVehicleId,
            MileageIn: 10000,
            EstimatedCompletionAt: null,
            ServiceAdvisorId: null,
            Notes: null
        );
        var created = await _service.CreateAsync(dto);

        // Act - Try to get with different company ID
        var result = await _service.GetByIdAsync(created.Id, Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetBySessionNumberAsync_ShouldReturnSession()
    {
        // Arrange
        var dto = new CreateSessionDto(
            CompanyId: _testCompanyId,
            BranchId: _testBranchId,
            ClientId: _testClientId,
            ClientVehicleId: _testVehicleId,
            MileageIn: 10000,
            EstimatedCompletionAt: null,
            ServiceAdvisorId: null,
            Notes: null
        );
        var created = await _service.CreateAsync(dto);

        // Act
        var result = await _service.GetBySessionNumberAsync(created.SessionNumber, _testCompanyId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(created.Id, result.Id);
    }

    [Fact]
    public async Task GetAllPagedAsync_ShouldReturnPagedResults()
    {
        // Arrange
        for (int i = 0; i < 15; i++)
        {
            var dto = new CreateSessionDto(
                CompanyId: _testCompanyId,
                BranchId: _testBranchId,
                ClientId: _testClientId,
                ClientVehicleId: _testVehicleId,
                MileageIn: 10000 + i,
                EstimatedCompletionAt: null,
                ServiceAdvisorId: null,
                Notes: $"Session {i}"
            );
            await _service.CreateAsync(dto);
        }

        var request = new PagedRequest { Page = 1, PageSize = 5 };

        // Act
        var result = await _service.GetAllPagedAsync(_testCompanyId, request);

        // Assert
        Assert.Equal(15, result.TotalCount);
        Assert.Equal(5, result.Items.Count);
        Assert.Equal(3, result.TotalPages);
        Assert.True(result.HasNextPage);
    }

    [Fact]
    public async Task GetAllPagedAsync_ShouldFilterByStatus()
    {
        // Arrange
        var dto1 = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 10000, null, null, null);
        var dto2 = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 20000, null, null, null);
        var session1 = await _service.CreateAsync(dto1);
        await _service.CreateAsync(dto2);

        // Update one session to InProgress
        await _service.UpdateStatusAsync(session1.Id, SessionStatus.InProgress, _testCompanyId);

        var request = new PagedRequest { Page = 1, PageSize = 10 };

        // Act
        var inProgressResults = await _service.GetAllPagedAsync(_testCompanyId, request, SessionStatus.InProgress);
        var checkedInResults = await _service.GetAllPagedAsync(_testCompanyId, request, SessionStatus.CheckedIn);

        // Assert
        Assert.Equal(1, inProgressResults.TotalCount);
        Assert.Equal(1, checkedInResults.TotalCount);
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldUpdateStatus()
    {
        // Arrange
        var dto = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 10000, null, null, null);
        var session = await _service.CreateAsync(dto);

        // Act
        var result = await _service.UpdateStatusAsync(session.Id, SessionStatus.Inspection, _testCompanyId);
        var updated = await _service.GetByIdAsync(session.Id, _testCompanyId);

        // Assert
        Assert.True(result);
        Assert.NotNull(updated);
        Assert.Equal(SessionStatus.Inspection, updated.Status);
    }

    [Fact]
    public async Task CheckOutAsync_ShouldCloseSessionWithMileage()
    {
        // Arrange
        var dto = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 50000, null, null, null);
        var session = await _service.CreateAsync(dto);

        // Act
        var result = await _service.CheckOutAsync(session.Id, 50100, _testCompanyId);
        var updated = await _service.GetByIdAsync(session.Id, _testCompanyId);

        // Assert
        Assert.True(result);
        Assert.NotNull(updated);
        Assert.Equal(SessionStatus.Closed, updated.Status);
        Assert.Equal(50100, updated.MileageOut);
        Assert.NotNull(updated.CheckOutAt);
    }

    [Fact]
    public async Task DeleteAsync_ShouldDeleteSession()
    {
        // Arrange
        var dto = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 10000, null, null, null);
        var session = await _service.CreateAsync(dto);

        // Act
        var deleted = await _service.DeleteAsync(session.Id, _testCompanyId);
        var result = await _service.GetByIdAsync(session.Id, _testCompanyId);

        // Assert
        Assert.True(deleted);
        Assert.Null(result);
    }

    [Fact]
    public async Task GenerateSessionNumberAsync_ShouldGenerateUniqueNumbers()
    {
        // Act
        var number1 = await _service.GenerateSessionNumberAsync(_testCompanyId);
        var dto = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 10000, null, null, null);
        await _service.CreateAsync(dto);
        var number2 = await _service.GenerateSessionNumberAsync(_testCompanyId);

        // Assert
        Assert.StartsWith("SES-", number1);
        Assert.StartsWith("SES-", number2);
        Assert.NotEqual(number1, number2);
    }

    [Fact]
    public async Task SearchAsync_ShouldFindBySessionNumber()
    {
        // Arrange
        var dto = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 10000, null, null, null);
        var session = await _service.CreateAsync(dto);

        // Act
        var results = (await _service.SearchAsync(_testCompanyId, session.SessionNumber)).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal(session.Id, results[0].Id);
    }

    [Fact]
    public async Task GetActiveSessionsAsync_ShouldReturnOnlyActiveStatuses()
    {
        // Arrange
        var dto1 = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 10000, null, null, null);
        var dto2 = new CreateSessionDto(_testCompanyId, _testBranchId, _testClientId, _testVehicleId, 20000, null, null, null);
        var session1 = await _service.CreateAsync(dto1);
        var session2 = await _service.CreateAsync(dto2);

        // Close one session
        await _service.CheckOutAsync(session1.Id, 10100, _testCompanyId);

        // Act
        var activeSessions = (await _service.GetActiveSessionsAsync(_testCompanyId)).ToList();

        // Assert
        Assert.Single(activeSessions);
        Assert.Equal(session2.Id, activeSessions[0].Id);
    }
}
