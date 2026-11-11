using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Data.Configurations;

public class AdmissionHoldConfiguration : IEntityTypeConfiguration<AdmissionHold>
{
    public void Configure(EntityTypeBuilder<AdmissionHold> builder)
    {
        builder.Property(x => x.StudentId).IsRequired();
        builder.Property(x => x.StudentName).HasMaxLength(100);
        builder.Property(x => x.GuardianPhone).HasMaxLength(20);

        builder.Property(x => x.ClassId).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        
        builder.HasIndex(x => x.StudentId);
    }
}