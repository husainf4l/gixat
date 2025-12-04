using Microsoft.EntityFrameworkCore;

namespace Gixat.Web.Shared.Services;

/// <summary>
/// Base service providing common DbContext access pattern for all services.
/// </summary>
public abstract class BaseService
{
    protected readonly DbContext Context;

    protected BaseService(DbContext context)
    {
        Context = context;
    }

    protected DbSet<T> Set<T>() where T : class => Context.Set<T>();

    protected async Task SaveChangesAsync() => await Context.SaveChangesAsync();
}
