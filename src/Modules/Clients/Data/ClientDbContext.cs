using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Clients.Entities;

namespace Gixat.Modules.Clients.Data;

public class ClientDbContext : DbContext
{
    public ClientDbContext(DbContextOptions<ClientDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ClientVehicle> ClientVehicles => Set<ClientVehicle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
    }
}
