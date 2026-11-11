using System.ComponentModel.DataAnnotations;
using Domain.Enums;

namespace Domain.Dtos;

public class AdmissionHoldDto
{
    public long Id { get; set; }
    public string StudentId { get; set; }
    public string StudentName { get; set; }
    public string GuardianPhone { get; set; }
    public long ClassId { get; set; }
    public HoldStatus Status { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApplyHoldVm
{
    [MaxLength(100)]
    public string StudentName { get; set; }

    [MaxLength(20)]
    public string GuardianPhone { get; set; }
}
