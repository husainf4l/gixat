using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Companies.Entities;

namespace Gixat.Modules.Companies.Data;

public class CompanyDbContext : DbContext
{
    public CompanyDbContext(DbContextOptions<CompanyDbContext> options) : base(options)
    {
    }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Branch> Branches => Set<Branch>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
    }
}
