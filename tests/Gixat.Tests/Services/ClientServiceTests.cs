using Microsoft.Extensions.Logging;
using Moq;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Clients.Services;

namespace Gixat.Tests.Services;

public class ClientServiceTests
{
    private readonly TestDbContext _context;
    private readonly ClientService _service;
    private readonly Guid _testCompanyId = Guid.NewGuid();

    public ClientServiceTests()
    {
        _context = TestDbContext.CreateInMemory();
        var logger = new Mock<ILogger<ClientService>>();
        _service = new ClientService(_context, logger.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateClient()
    {
        // Arrange
        var client = new Client
        {
            FirstName = "John",
            LastName = "Doe",
            Phone = "1234567890",
            Email = "john.doe@example.com",
            CompanyId = _testCompanyId
        };

        // Act
        var result = await _service.CreateAsync(client);

        // Assert
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("John", result.FirstName);
        Assert.Equal("Doe", result.LastName);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnClient_WhenExists()
    {
        // Arrange
        var client = new Client
        {
            FirstName = "Jane",
            LastName = "Smith",
            Phone = "9876543210",
            CompanyId = _testCompanyId
        };
        await _service.CreateAsync(client);

        // Act
        var result = await _service.GetByIdAsync(client.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Jane", result.FirstName);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _service.GetByIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByCompanyIdAsync_ShouldReturnClients_ForCompany()
    {
        // Arrange
        var client1 = new Client { FirstName = "Client1", LastName = "Test", Phone = "111", CompanyId = _testCompanyId };
        var client2 = new Client { FirstName = "Client2", LastName = "Test", Phone = "222", CompanyId = _testCompanyId };
        var client3 = new Client { FirstName = "Client3", LastName = "Test", Phone = "333", CompanyId = Guid.NewGuid() };

        await _service.CreateAsync(client1);
        await _service.CreateAsync(client2);
        await _service.CreateAsync(client3);

        // Act
        var results = (await _service.GetByCompanyIdAsync(_testCompanyId)).ToList();

        // Assert
        Assert.Equal(2, results.Count);
        Assert.All(results, c => Assert.Equal(_testCompanyId, c.CompanyId));
    }

    [Fact]
    public async Task GetByCompanyIdPagedAsync_ShouldReturnPagedResults()
    {
        // Arrange
        for (int i = 0; i < 25; i++)
        {
            var client = new Client
            {
                FirstName = $"Client{i}",
                LastName = "Test",
                Phone = $"000{i}",
                CompanyId = _testCompanyId
            };
            await _service.CreateAsync(client);
        }

        var request = new Gixat.Shared.Pagination.PagedRequest
        {
            Page = 1,
            PageSize = 10
        };

        // Act
        var result = await _service.GetByCompanyIdPagedAsync(_testCompanyId, request);

        // Assert
        Assert.Equal(25, result.TotalCount);
        Assert.Equal(10, result.Items.Count);
        Assert.Equal(3, result.TotalPages);
        Assert.True(result.HasNextPage);
        Assert.False(result.HasPreviousPage);
    }

    [Fact]
    public async Task GetByCompanyIdPagedAsync_ShouldFilterBySearchTerm()
    {
        // Arrange
        var client1 = new Client { FirstName = "John", LastName = "Doe", Phone = "111", CompanyId = _testCompanyId };
        var client2 = new Client { FirstName = "Jane", LastName = "Smith", Phone = "222", CompanyId = _testCompanyId };
        await _service.CreateAsync(client1);
        await _service.CreateAsync(client2);

        var request = new Gixat.Shared.Pagination.PagedRequest
        {
            Page = 1,
            PageSize = 10,
            SearchTerm = "John"
        };

        // Act
        var result = await _service.GetByCompanyIdPagedAsync(_testCompanyId, request);

        // Assert
        Assert.Equal(1, result.TotalCount);
        Assert.Equal("John", result.Items.First().FirstName);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateClient()
    {
        // Arrange
        var client = new Client
        {
            FirstName = "Original",
            LastName = "Name",
            Phone = "1111111111",
            CompanyId = _testCompanyId
        };
        await _service.CreateAsync(client);

        client.FirstName = "Updated";
        client.LastName = "FullName";

        // Act
        var result = await _service.UpdateAsync(client);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated", result.FirstName);
        Assert.Equal("FullName", result.LastName);
    }

    [Fact]
    public async Task DeleteAsync_ShouldDeleteClient()
    {
        // Arrange
        var client = new Client
        {
            FirstName = "ToDelete",
            LastName = "Client",
            Phone = "9999999999",
            CompanyId = _testCompanyId
        };
        await _service.CreateAsync(client);

        // Act
        var deleted = await _service.DeleteAsync(client.Id);
        var result = await _service.GetByIdAsync(client.Id);

        // Assert
        Assert.True(deleted);
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_ShouldReturnFalse_WhenNotExists()
    {
        // Act
        var result = await _service.DeleteAsync(Guid.NewGuid());

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task ActivateAsync_ShouldActivateClient()
    {
        // Arrange
        var client = new Client
        {
            FirstName = "Inactive",
            LastName = "Client",
            Phone = "5555555555",
            CompanyId = _testCompanyId,
            IsActive = false
        };
        await _service.CreateAsync(client);

        // Act
        var activated = await _service.ActivateAsync(client.Id);
        var result = await _service.GetByIdAsync(client.Id);

        // Assert
        Assert.True(activated);
        Assert.NotNull(result);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task DeactivateAsync_ShouldDeactivateClient()
    {
        // Arrange
        var client = new Client
        {
            FirstName = "Active",
            LastName = "Client",
            Phone = "6666666666",
            CompanyId = _testCompanyId,
            IsActive = true
        };
        await _service.CreateAsync(client);

        // Act
        var deactivated = await _service.DeactivateAsync(client.Id);
        var result = await _service.GetByIdAsync(client.Id);

        // Assert
        Assert.True(deactivated);
        Assert.NotNull(result);
        Assert.False(result.IsActive);
    }

    [Fact]
    public async Task GetClientCountAsync_ShouldReturnActiveCount()
    {
        // Arrange
        var activeClient = new Client { FirstName = "Active", LastName = "A", Phone = "111", CompanyId = _testCompanyId, IsActive = true };
        var inactiveClient = new Client { FirstName = "Inactive", LastName = "B", Phone = "222", CompanyId = _testCompanyId, IsActive = false };
        await _service.CreateAsync(activeClient);
        await _service.CreateAsync(inactiveClient);
        await _service.DeactivateAsync(inactiveClient.Id);

        // Act
        var count = await _service.GetClientCountAsync(_testCompanyId);

        // Assert
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task SearchAsync_ShouldFindClientsByName()
    {
        // Arrange
        var client1 = new Client { FirstName = "TestSearch", LastName = "User", Phone = "111", CompanyId = _testCompanyId };
        var client2 = new Client { FirstName = "Other", LastName = "Person", Phone = "222", CompanyId = _testCompanyId };
        await _service.CreateAsync(client1);
        await _service.CreateAsync(client2);

        // Act
        var results = (await _service.SearchAsync(_testCompanyId, "TestSearch")).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("TestSearch", results[0].FirstName);
    }

    [Fact]
    public async Task SearchAsync_ShouldFindClientsByPhone()
    {
        // Arrange
        var client = new Client { FirstName = "Phone", LastName = "Search", Phone = "999888777", CompanyId = _testCompanyId };
        await _service.CreateAsync(client);

        // Act
        var results = (await _service.SearchAsync(_testCompanyId, "999888")).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("999888777", results[0].Phone);
    }
}
