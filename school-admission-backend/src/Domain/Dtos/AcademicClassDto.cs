using System.ComponentModel.DataAnnotations;
using Domain.Enums;
using Framework.Models;

namespace Domain.Dtos;

public class AcademicClassDto
{
    public long Id { get; set; }
    public string Name { get; set; }
    public int Order { get; set; }
    public int TotalSeats { get; set; }
    public bool IsActive { get; set; }
    public Shift Shift { get; set; }
    public long? AdmissionId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AcademicClassVm
{
    public long? Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Range(0, int.MaxValue)]
    public int Order { get; set; }

    [Range(1, int.MaxValue)]
    public int TotalSeats { get; set; }

    public bool IsActive { get; set; } = true;

    public Shift Shift { get; set; }
}

public class AcademicClassQueryParams : Queryparams
{
    public Shift? Shift { get; set; }
}
