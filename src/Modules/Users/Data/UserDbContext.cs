using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Users.Entities;

namespace Gixat.Modules.Users.Data;

public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options)
    {
    }

    public DbSet<CompanyUser> CompanyUsers => Set<CompanyUser>();
    public DbSet<UserInvitation> UserInvitations => Set<UserInvitation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

            // Indexes
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
    }
}
