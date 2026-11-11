using Domain.Enums;
using Framework.Entities;

namespace Domain.Entities;

public class Admission : BaseEntity
{
    public string Title { get; set; }

    public string Description { get; set; }

    public DateTime OpensAt { get; set; }

    public DateTime ClosesAt { get; set; }

    public int HoldMinutes { get; set; } = 10;

    public int WaitlistHoldMinutes { get; set; } = 30;

    public AdmissionStatus Status { get; set; } = AdmissionStatus.Draft;
}
