using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Data.Configurations;

public class AdmissionConfiguration : IEntityTypeConfiguration<Admission>
{
    public void Configure(EntityTypeBuilder<Admission> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired(false);

        builder.Property(x => x.OpensAt).IsRequired();
        builder.Property(x => x.ClosesAt).IsRequired();

        builder.Property(x => x.HoldMinutes).IsRequired();
        builder.Property(x => x.WaitlistHoldMinutes).IsRequired().HasDefaultValue(30);
        builder.Property(x => x.Status).IsRequired();
    }
}
