using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Clients.Entities;
using Gixat.Modules.Companies.Entities;
using Gixat.Modules.Sessions.Entities;

namespace Gixat.Tests;

/// <summary>
/// Test database context for unit testing services
/// </summary>
public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ClientVehicle> ClientVehicles => Set<ClientVehicle>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<GarageSession> GarageSessions => Set<GarageSession>();
    public DbSet<CustomerRequest> CustomerRequests => Set<CustomerRequest>();
    public DbSet<Inspection> Inspections => Set<Inspection>();
    public DbSet<InspectionItem> InspectionItems => Set<InspectionItem>();
    public DbSet<TestDrive> TestDrives => Set<TestDrive>();
    public DbSet<JobCard> JobCards => Set<JobCard>();
    public DbSet<JobCardItem> JobCardItems => Set<JobCardItem>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Client
        modelBuilder.Entity<Client>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            b.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            b.Property(e => e.Phone).HasMaxLength(20).IsRequired();
            b.HasMany(e => e.Vehicles).WithOne(v => v.Client).HasForeignKey(v => v.ClientId);
        });

        // Configure ClientVehicle
        modelBuilder.Entity<ClientVehicle>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Make).HasMaxLength(50).IsRequired();
            b.Property(e => e.Model).HasMaxLength(50).IsRequired();
        });

        // Configure Company
        modelBuilder.Entity<Company>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Name).HasMaxLength(200).IsRequired();
        });

        // Configure Branch
        modelBuilder.Entity<Branch>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Name).HasMaxLength(100).IsRequired();
        });

        // Configure GarageSession
        modelBuilder.Entity<GarageSession>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.SessionNumber).HasMaxLength(50).IsRequired();
        });

        // Configure CustomerRequest
        modelBuilder.Entity<CustomerRequest>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasMany(e => e.MediaItems).WithOne().HasForeignKey(m => m.CustomerRequestId);
        });

        // Configure Inspection
        modelBuilder.Entity<Inspection>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.InspectionId);
            b.HasMany(e => e.MediaItems).WithOne().HasForeignKey(m => m.InspectionId);
        });

        // Configure InspectionItem
        modelBuilder.Entity<InspectionItem>(b =>
        {
            b.HasKey(e => e.Id);
        });

        // Configure TestDrive
        modelBuilder.Entity<TestDrive>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasMany(e => e.MediaItems).WithOne().HasForeignKey(m => m.TestDriveId);
        });

        // Configure JobCard
        modelBuilder.Entity<JobCard>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.JobCardNumber).HasMaxLength(50).IsRequired();
            b.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.JobCardId);
            b.HasMany(e => e.MediaItems).WithOne().HasForeignKey(m => m.JobCardId);
        });

        // Configure JobCardItem
        modelBuilder.Entity<JobCardItem>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasMany(e => e.MediaItems).WithOne().HasForeignKey(m => m.JobCardItemId);
        });

        // Configure MediaItem
        modelBuilder.Entity<MediaItem>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.FileName).HasMaxLength(255).IsRequired();
        });
    }

    /// <summary>
    /// Create an in-memory database context for testing
    /// </summary>
    public static TestDbContext CreateInMemory(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        var context = new TestDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
