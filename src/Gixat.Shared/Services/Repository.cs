using Microsoft.EntityFrameworkCore;
using Gixat.Shared.Entities;

namespace Gixat.Shared.Services;

/// <summary>
/// Generic repository implementation for common CRUD operations.
/// </summary>
public class Repository<T> : BaseService where T : BaseEntity
{
    public Repository(DbContext context) : base(context) { }

    protected DbSet<T> DbSet => Set<T>();

    public virtual async Task<T?> GetByIdAsync(Guid id)
        => await DbSet.FindAsync(id);

    public virtual async Task<IEnumerable<T>> GetAllAsync()
        => await DbSet.ToListAsync();

    public virtual async Task<T> AddAsync(T entity)
    {
        DbSet.Add(entity);
        await SaveChangesAsync();
        return entity;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        await SaveChangesAsync();
    }

    public virtual async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await DbSet.FindAsync(id);
        if (entity == null) return false;

        DbSet.Remove(entity);
        await SaveChangesAsync();
        return true;
    }

    public virtual async Task<bool> ExistsAsync(Guid id)
        => await DbSet.AnyAsync(e => e.Id == id);

    public virtual async Task<int> CountAsync()
        => await DbSet.CountAsync();
}
