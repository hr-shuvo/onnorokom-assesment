using Domain.Enums;
using Framework.Entities;

namespace Domain.Entities;

public class AdmissionHold: BaseEntity
{
    public string StudentId { get; set; }

    public string StudentName { get; set; }

    public string GuardianPhone { get; set; }

    public long ClassId { get; set; }
    
    public HoldStatus Status { get; set; }
    
    public DateTime ExpiresAt { get; set; }
    
    public DateTime? ConfirmedAt { get; set; }
    
    
}