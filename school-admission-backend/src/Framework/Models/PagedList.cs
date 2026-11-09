using Microsoft.EntityFrameworkCore;

namespace Framework.Models;

public class PagedList<T>
{
    public PagedList(IEnumerable<T> items, int count, int pageNumber, int pageSize)
    {
        CurrentPage = pageNumber;
        TotalPage = (int)Math.Ceiling(count / (double)pageSize);
        PageSize = pageSize;
        TotalCount = count;
        Items = items.ToList();

    }

    public List<T> Items { get; set; }
    public int CurrentPage { get; set; }
    public int TotalPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }

}

public class PaginatedList<T> : List<T>
{
    public PaginatedList(IEnumerable<T> items, int count, int pageNumber, int pageSize)
    {
        CurrentPage = pageNumber;
        TotalPage = (int)Math.Ceiling(count / (double)pageSize);
        PageSize = pageSize;
        TotalCount = count;
        // AddRange(items); // If inheriting from List<T>
        Items = items.ToList();

    }

    public List<T> Items { get; set; }
    public int CurrentPage { get; set; }
    public int TotalPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    
    // Factory method to create a PagedList from an IQueryable source
    public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize)
    {
        var count = await source.CountAsync();
        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedList<T>(items, count, pageNumber, pageSize);
    }
    
    public static PaginatedList<T> Empty(int pageNumber, int pageSize) =>
        new([], 0, pageNumber, pageSize);
}