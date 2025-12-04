namespace Gixat.Web.Shared.DTOs;

/// <summary>
/// Standard pagination request parameters.
/// </summary>
public record PagedRequest(
    int Page = 1,
    int PageSize = 20,
    string? SortBy = null,
    bool SortDescending = false,
    string? Search = null
);

/// <summary>
/// Standard paginated response wrapper.
/// </summary>
public record PagedResponse<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
)
{
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public static PagedResponse<T> Create(IEnumerable<T> items, int totalCount, PagedRequest request)
    {
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);
        return new PagedResponse<T>(items, totalCount, request.Page, request.PageSize, totalPages);
    }
}
