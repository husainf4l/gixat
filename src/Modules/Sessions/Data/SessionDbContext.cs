using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Sessions.Entities;

namespace Gixat.Modules.Sessions.Data;

public class SessionDbContext : DbContext
{
    public SessionDbContext(DbContextOptions<SessionDbContext> options) : base(options)
    {
    }

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

        // GarageSession
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

        // CustomerRequest
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

        // Inspection
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

        // InspectionItem
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

        // TestDrive
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

        // JobCard
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

        // JobCardItem
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

        // MediaItem
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
