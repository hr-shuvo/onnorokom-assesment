using System.ComponentModel.DataAnnotations;

namespace Domain.Settings;

public class AdmissionSettings
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = "Admission";

    public string Description { get; set; }

    public DateTime OpensAt { get; set; } = DateTime.UtcNow;

    public DateTime ClosesAt { get; set; } = DateTime.UtcNow.AddDays(30);

    [Range(1, int.MaxValue)]
    public int HoldMinutes { get; set; } = 10;

    [Range(1, int.MaxValue)]
    public int WaitlistHoldMinutes { get; set; } = 30;

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
