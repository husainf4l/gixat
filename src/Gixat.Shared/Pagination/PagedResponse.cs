namespace Gixat.Shared.Pagination;

/// <summary>
/// Paginated response wrapper
/// </summary>
/// <typeparam name="T">Type of items in the response</typeparam>
public class PagedResponse<T>
{
    /// <summary>
    /// The items for the current page
    /// </summary>
    public IReadOnlyList<T> Items { get; set; } = [];
    
    /// <summary>
    /// Total number of items across all pages
    /// </summary>
    public int TotalCount { get; set; }
    
    /// <summary>
    /// Current page number (1-based)
    /// </summary>
    public int Page { get; set; }
    
    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; set; }
    
    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    
    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPreviousPage => Page > 1;
    
    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNextPage => Page < TotalPages;
    
    /// <summary>
    /// Create a new paged response
    /// </summary>
    public static PagedResponse<T> Create(IReadOnlyList<T> items, int totalCount, int page, int pageSize)
    {
        return new PagedResponse<T>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
    
    /// <summary>
    /// Create an empty paged response
    /// </summary>
    public static PagedResponse<T> Empty(int page = 1, int pageSize = 20)
    {
        return new PagedResponse<T>
        {
            Items = [],
            TotalCount = 0,
            Page = page,
            PageSize = pageSize
        };
    }
}
