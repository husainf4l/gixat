namespace Gixat.Web.Shared.Pagination;

/// <summary>
/// Request parameters for paginated queries
/// </summary>
public class PagedRequest
{
    private int _page = 1;
    private int _pageSize = 20;
    
    /// <summary>
    /// Page number (1-based). Defaults to 1.
    /// </summary>
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }
    
    /// <summary>
    /// Number of items per page. Defaults to 20. Max is 100.
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? 20 : (value > 100 ? 100 : value);
    }
    
    /// <summary>
    /// Optional search term for filtering
    /// </summary>
    public string? SearchTerm { get; set; }
    
    /// <summary>
    /// Optional sort field
    /// </summary>
    public string? SortBy { get; set; }
    
    /// <summary>
    /// Sort direction (asc or desc). Defaults to desc.
    /// </summary>
    public bool SortDescending { get; set; } = true;
    
    /// <summary>
    /// Number of items to skip for pagination
    /// </summary>
    public int Skip => (Page - 1) * PageSize;
}
