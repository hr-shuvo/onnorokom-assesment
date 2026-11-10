using System.ComponentModel.DataAnnotations;
using Domain.Enums;
using Framework.Models;

namespace Domain.Dtos;

public class AdmissionDto
{
    public long Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime OpensAt { get; set; }
    public DateTime ClosesAt { get; set; }
    public int HoldMinutes { get; set; }
    public AdmissionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AdmissionVm
{
    public long? Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; }

    public string Description { get; set; }

    [Required]
    public DateTime OpensAt { get; set; }

    [Required]
    public DateTime ClosesAt { get; set; }

    [Range(1, int.MaxValue)]
    public int HoldMinutes { get; set; } = 10;
}

public class AdmissionQueryParams : Queryparams
{
    public AdmissionStatus? Status { get; set; }
}
