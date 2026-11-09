using Domain.Enums;
using Framework.Entities;

namespace Domain.Entities;

public class AcademicClass : BaseEntity
{
    public string Name { get; set; }
    public int TotalSeats { get; set; }
    public Shift Shift { get; set; }
}