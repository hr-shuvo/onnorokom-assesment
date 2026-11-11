using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Data.Configurations;

public class AdmissionHoldConfiguration : IEntityTypeConfiguration<AdmissionHold>
{
    public void Configure(EntityTypeBuilder<AdmissionHold> builder)
    {
        builder.Property(x => x.StudentId).IsRequired();
        builder.Property(x => x.StudentName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.GuardianPhone).HasMaxLength(20);

        builder.Property(x => x.ClassId).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.ExpiresAt).IsRequired();

        builder.HasIndex(x => x.StudentId).IsUnique();
    }
}