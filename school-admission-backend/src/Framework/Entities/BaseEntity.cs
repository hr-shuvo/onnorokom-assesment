namespace Framework.Entities;

public class BaseEntity
{
    public long Id { get; set; }

    public int Order { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}