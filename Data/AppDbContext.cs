using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Modules.Auth.Entities;
using Gixat.Web.Modules.Companies.Entities;
using Gixat.Web.Modules.Clients.Entities;
using Gixat.Web.Modules.Users.Entities;
using Gixat.Web.Modules.Sessions.Entities;
using Gixat.Web.Modules.Appointments.Entities;
using Gixat.Web.Modules.Invoices.Entities;
using Gixat.Web.Modules.Inventory.Entities;

namespace Gixat.Web.Data;

/// <summary>
/// Unified application database context containing all entities.
/// Single context = single migration path = best practice.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Companies Module
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Branch> Branches => Set<Branch>();

    // Users Module
    public DbSet<CompanyUser> CompanyUsers => Set<CompanyUser>();
    public DbSet<UserInvitation> UserInvitations => Set<UserInvitation>();

    // Clients Module
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ClientVehicle> ClientVehicles => Set<ClientVehicle>();

    // Sessions Module
    public DbSet<GarageSession> GarageSessions => Set<GarageSession>();
    public DbSet<CustomerRequest> CustomerRequests => Set<CustomerRequest>();
    public DbSet<Inspection> Inspections => Set<Inspection>();
    public DbSet<InspectionItem> InspectionItems => Set<InspectionItem>();
    public DbSet<TestDrive> TestDrives => Set<TestDrive>();
    public DbSet<JobCard> JobCards => Set<JobCard>();
    public DbSet<JobCardItem> JobCardItems => Set<JobCardItem>();
    public DbSet<JobCardComment> JobCardComments => Set<JobCardComment>();
    public DbSet<JobCardTimeEntry> JobCardTimeEntries => Set<JobCardTimeEntry>();
    public DbSet<JobCardPart> JobCardParts => Set<JobCardPart>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();

    // Appointments Module
    public DbSet<Appointment> Appointments => Set<Appointment>();

    // Invoices Module
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();

    // Inventory Module
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ============================================
        // Auth / Identity Configuration
        // ============================================
        modelBuilder.Entity<ApplicationUser>(b =>
        {
            b.ToTable("Users");
            b.Property(u => u.FirstName).HasMaxLength(100);
            b.Property(u => u.LastName).HasMaxLength(100);
        });

        modelBuilder.Entity<ApplicationRole>(b =>
        {
            b.ToTable("Roles");
            b.Property(r => r.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        // ============================================
        // Companies Module Configuration
        // ============================================
        modelBuilder.Entity<Company>(b =>
        {
            b.ToTable("Companies");
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(200).IsRequired();
            b.Property(c => c.TradeName).HasMaxLength(200);
            b.Property(c => c.Email).HasMaxLength(256).IsRequired();
            b.Property(c => c.Phone).HasMaxLength(50);
            b.Property(c => c.TaxId).HasMaxLength(50);
            b.Property(c => c.RegistrationNumber).HasMaxLength(100);
            b.Property(c => c.Website).HasMaxLength(256);
            b.Property(c => c.Address).HasMaxLength(500);
            b.Property(c => c.City).HasMaxLength(100);
            b.Property(c => c.State).HasMaxLength(100);
            b.Property(c => c.PostalCode).HasMaxLength(20);
            b.Property(c => c.Country).HasMaxLength(100);
            b.Property(c => c.LogoUrl).HasMaxLength(500);
            b.Property(c => c.TimeZone).HasMaxLength(100);
            b.Property(c => c.Currency).HasMaxLength(10);
            b.Property(c => c.Locale).HasMaxLength(20);

            b.HasIndex(c => c.Email).IsUnique();
            b.HasIndex(c => c.OwnerId);
        });

        modelBuilder.Entity<Branch>(b =>
        {
            b.ToTable("Branches");
            b.HasKey(br => br.Id);
            b.Property(br => br.Name).HasMaxLength(100).IsRequired();
            b.Property(br => br.Code).HasMaxLength(20);
            b.Property(br => br.Phone).HasMaxLength(50);
            b.Property(br => br.Email).HasMaxLength(256);
            b.Property(br => br.Address).HasMaxLength(500);
            b.Property(br => br.City).HasMaxLength(100);
            b.Property(br => br.State).HasMaxLength(100);
            b.Property(br => br.PostalCode).HasMaxLength(20);

            b.HasOne(br => br.Company)
                .WithMany()
                .HasForeignKey(br => br.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(br => br.CompanyId);
        });

        // ============================================
        // Users Module Configuration
        // ============================================
        modelBuilder.Entity<CompanyUser>(b =>
        {
            b.ToTable("CompanyUsers");
            b.HasKey(u => u.Id);
            
            b.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            b.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            b.Property(u => u.Email).HasMaxLength(256).IsRequired();
            b.Property(u => u.Phone).HasMaxLength(50);
            b.Property(u => u.Avatar).HasMaxLength(500);
            b.Property(u => u.EmployeeId).HasMaxLength(50);
            b.Property(u => u.JobTitle).HasMaxLength(100);
            b.Property(u => u.Department).HasMaxLength(100);
            b.Property(u => u.Permissions).HasMaxLength(4000);

            b.HasIndex(u => u.AuthUserId);
            b.HasIndex(u => u.CompanyId);
            b.HasIndex(u => u.Email);
            b.HasIndex(u => new { u.CompanyId, u.AuthUserId }).IsUnique();
        });

        modelBuilder.Entity<UserInvitation>(b =>
        {
            b.ToTable("UserInvitations");
            b.HasKey(i => i.Id);
            
            b.Property(i => i.Email).HasMaxLength(256).IsRequired();
            b.Property(i => i.FirstName).HasMaxLength(100);
            b.Property(i => i.LastName).HasMaxLength(100);
            b.Property(i => i.Token).HasMaxLength(256).IsRequired();

            b.HasIndex(i => i.Token).IsUnique();
            b.HasIndex(i => i.CompanyId);
            b.HasIndex(i => i.Email);
        });

        // ============================================
        // Clients Module Configuration
        // ============================================
        modelBuilder.Entity<Client>(entity =>
        {
            entity.ToTable("Clients");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.Phone).HasMaxLength(50).IsRequired();
            entity.Property(e => e.AlternatePhone).HasMaxLength(50);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.State).HasMaxLength(100);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.PreferredContactMethod).HasMaxLength(50);
            entity.Property(e => e.TotalSpent).HasPrecision(18, 2);

            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Phone);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => new { e.CompanyId, e.Phone }).IsUnique();

            entity.HasMany(e => e.Vehicles)
                .WithOne(v => v.Client)
                .HasForeignKey(v => v.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ClientVehicle>(entity =>
        {
            entity.ToTable("ClientVehicles");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Make).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Model).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.LicensePlate).HasMaxLength(20);
            entity.Property(e => e.Vin).HasMaxLength(50);
            entity.Property(e => e.EngineType).HasMaxLength(50);
            entity.Property(e => e.Transmission).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(1000);

            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.LicensePlate);
            entity.HasIndex(e => e.Vin);
        });

        // ============================================
        // Sessions Module Configuration
        // ============================================
        modelBuilder.Entity<GarageSession>(entity =>
        {
            entity.ToTable("GarageSessions");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.SessionNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.InternalNotes).HasMaxLength(2000);
            
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.BranchId);
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.ClientVehicleId);
            entity.HasIndex(e => e.SessionNumber);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.CompanyId, e.SessionNumber }).IsUnique();
            // Composite indexes for dashboard and date-range queries
            entity.HasIndex(e => new { e.CompanyId, e.CheckInAt });
            entity.HasIndex(e => new { e.CompanyId, e.Status, e.CheckInAt });

            entity.HasOne(e => e.CustomerRequest)
                .WithOne(r => r.Session)
                .HasForeignKey<CustomerRequest>(r => r.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Inspection)
                .WithOne(i => i.Session)
                .HasForeignKey<Inspection>(i => i.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TestDrive)
                .WithOne(t => t.Session)
                .HasForeignKey<TestDrive>(t => t.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.JobCard)
                .WithOne(j => j.Session)
                .HasForeignKey<JobCard>(j => j.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.MediaItems)
                .WithOne(m => m.Session)
                .HasForeignKey(m => m.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CustomerRequest>(entity =>
        {
            entity.ToTable("CustomerRequests");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(4000);
            entity.Property(e => e.CustomerConcerns).HasMaxLength(4000);
            entity.Property(e => e.RequestedServices).HasMaxLength(4000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            
            entity.HasIndex(e => e.SessionId).IsUnique();
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Status);

            entity.HasMany(e => e.MediaItems)
                .WithOne(m => m.CustomerRequest)
                .HasForeignKey(m => m.CustomerRequestId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Inspection>(entity =>
        {
            entity.ToTable("Inspections");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(4000);
            entity.Property(e => e.ExteriorCondition).HasMaxLength(1000);
            entity.Property(e => e.InteriorCondition).HasMaxLength(1000);
            entity.Property(e => e.EngineCondition).HasMaxLength(1000);
            entity.Property(e => e.TransmissionCondition).HasMaxLength(1000);
            entity.Property(e => e.BrakeCondition).HasMaxLength(1000);
            entity.Property(e => e.TireCondition).HasMaxLength(1000);
            entity.Property(e => e.SuspensionCondition).HasMaxLength(1000);
            entity.Property(e => e.ElectricalCondition).HasMaxLength(1000);
            entity.Property(e => e.FluidLevels).HasMaxLength(1000);
            entity.Property(e => e.Findings).HasMaxLength(4000);
            entity.Property(e => e.Recommendations).HasMaxLength(4000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            
            entity.HasIndex(e => e.SessionId).IsUnique();
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Status);

            entity.HasMany(e => e.Items)
                .WithOne(i => i.Inspection)
                .HasForeignKey(i => i.InspectionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.MediaItems)
                .WithOne(m => m.Inspection)
                .HasForeignKey(m => m.InspectionId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<InspectionItem>(entity =>
        {
            entity.ToTable("InspectionItems");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Category).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ItemName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Condition).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            
            entity.HasIndex(e => e.InspectionId);
        });

        modelBuilder.Entity<TestDrive>(entity =>
        {
            entity.ToTable("TestDrives");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(4000);
            entity.Property(e => e.RouteDescription).HasMaxLength(1000);
            entity.Property(e => e.EnginePerformance).HasMaxLength(1000);
            entity.Property(e => e.TransmissionPerformance).HasMaxLength(1000);
            entity.Property(e => e.BrakePerformance).HasMaxLength(1000);
            entity.Property(e => e.SteeringPerformance).HasMaxLength(1000);
            entity.Property(e => e.SuspensionPerformance).HasMaxLength(1000);
            entity.Property(e => e.NoiseObservations).HasMaxLength(1000);
            entity.Property(e => e.VibrationObservations).HasMaxLength(1000);
            entity.Property(e => e.ElectricalObservations).HasMaxLength(1000);
            entity.Property(e => e.AcPerformance).HasMaxLength(1000);
            entity.Property(e => e.Findings).HasMaxLength(4000);
            entity.Property(e => e.Recommendations).HasMaxLength(4000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            
            entity.HasIndex(e => e.SessionId).IsUnique();
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Status);

            entity.HasMany(e => e.MediaItems)
                .WithOne(m => m.TestDrive)
                .HasForeignKey(m => m.TestDriveId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<JobCard>(entity =>
        {
            entity.ToTable("JobCards");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.JobCardNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(4000);
            entity.Property(e => e.EstimatedHours).HasPrecision(10, 2);
            entity.Property(e => e.ActualHours).HasPrecision(10, 2);
            entity.Property(e => e.ApprovalNotes).HasMaxLength(1000);
            entity.Property(e => e.CustomerAuthorizationMethod).HasMaxLength(50);
            entity.Property(e => e.CustomerAuthorizationNotes).HasMaxLength(1000);
            entity.Property(e => e.WorkSummary).HasMaxLength(4000);
            entity.Property(e => e.TechnicianNotes).HasMaxLength(4000);
            entity.Property(e => e.QualityNotes).HasMaxLength(2000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.InternalNotes).HasMaxLength(2000);
            
            entity.HasIndex(e => e.SessionId).IsUnique();
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.JobCardNumber);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.CompanyId, e.JobCardNumber }).IsUnique();

            entity.HasMany(e => e.Items)
                .WithOne(i => i.JobCard)
                .HasForeignKey(i => i.JobCardId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.MediaItems)
                .WithOne(m => m.JobCard)
                .HasForeignKey(m => m.JobCardId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<JobCardItem>(entity =>
        {
            entity.ToTable("JobCardItems");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Source).HasMaxLength(50);
            entity.Property(e => e.EstimatedHours).HasPrecision(10, 2);
            entity.Property(e => e.ActualHours).HasPrecision(10, 2);
            entity.Property(e => e.WorkPerformed).HasMaxLength(4000);
            entity.Property(e => e.TechnicianNotes).HasMaxLength(2000);
            entity.Property(e => e.QualityCheckNotes).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            
            entity.HasIndex(e => e.JobCardId);
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Status);

            entity.HasMany(e => e.MediaItems)
                .WithOne(m => m.JobCardItem)
                .HasForeignKey(m => m.JobCardItemId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<JobCardComment>(entity =>
        {
            entity.ToTable("JobCardComments");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
            entity.Property(e => e.AuthorName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Content).HasMaxLength(4000).IsRequired();
            entity.Property(e => e.MentionedUserIds).HasMaxLength(1000);
            entity.Property(e => e.AttachmentUrl).HasMaxLength(2000);
            entity.Property(e => e.AttachmentName).HasMaxLength(500);
            
            entity.HasIndex(e => e.JobCardId);
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.AuthorId);
            entity.HasIndex(e => e.ParentCommentId);
            entity.HasIndex(e => e.CreatedAt);
            
            entity.HasOne(e => e.JobCard)
                .WithMany(j => j.Comments)
                .HasForeignKey(e => e.JobCardId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(e => e.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<JobCardTimeEntry>(entity =>
        {
            entity.ToTable("JobCardTimeEntries");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.TechnicianName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.Hours).HasPrecision(10, 2);
            entity.Property(e => e.HourlyRate).HasPrecision(10, 2);
            entity.Property(e => e.TotalCost).HasPrecision(10, 2);
            
            entity.HasIndex(e => e.JobCardId);
            entity.HasIndex(e => e.JobCardItemId);
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.TechnicianId);
            entity.HasIndex(e => e.StartTime);
            entity.HasIndex(e => e.IsActive);
            
            entity.HasOne(e => e.JobCard)
                .WithMany(j => j.TimeEntries)
                .HasForeignKey(e => e.JobCardId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.JobCardItem)
                .WithMany(i => i.TimeEntries)
                .HasForeignKey(e => e.JobCardItemId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<JobCardPart>(entity =>
        {
            entity.ToTable("JobCardParts");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.PartNumber).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PartName).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Unit).HasMaxLength(50);
            entity.Property(e => e.QuantityUsed).HasPrecision(10, 3);
            entity.Property(e => e.UnitCost).HasPrecision(10, 2);
            entity.Property(e => e.UnitPrice).HasPrecision(10, 2);
            entity.Property(e => e.Markup).HasPrecision(5, 2);
            entity.Property(e => e.TotalCost).HasPrecision(10, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(10, 2);
            entity.Property(e => e.Source).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Supplier).HasMaxLength(200);
            entity.Property(e => e.SupplierPartNumber).HasMaxLength(100);
            entity.Property(e => e.WarrantyInfo).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            
            entity.HasIndex(e => e.JobCardId);
            entity.HasIndex(e => e.JobCardItemId);
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.InventoryItemId);
            entity.HasIndex(e => e.PartNumber);
            entity.HasIndex(e => e.Status);
            
            entity.HasOne(e => e.JobCard)
                .WithMany(j => j.Parts)
                .HasForeignKey(e => e.JobCardId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.JobCardItem)
                .WithMany(i => i.Parts)
                .HasForeignKey(e => e.JobCardItemId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MediaItem>(entity =>
        {
            entity.ToTable("MediaItems");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.FileName).HasMaxLength(500).IsRequired();
            entity.Property(e => e.OriginalFileName).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ContentType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.S3Key).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.S3Bucket).HasMaxLength(200).IsRequired();
            entity.Property(e => e.S3Url).HasMaxLength(2000);
            entity.Property(e => e.Title).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Tags).HasMaxLength(500);
            entity.Property(e => e.ThumbnailS3Key).HasMaxLength(1000);
            
            entity.HasIndex(e => e.SessionId);
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.S3Key);
            entity.HasIndex(e => e.MediaType);
            entity.HasIndex(e => e.Category);
        });
    }
}
