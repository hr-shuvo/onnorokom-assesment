
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Domain.Data.Configurations;

public class AcademicClassConfiguration : IEntityTypeConfiguration<AcademicClass>
{
    public void Configure(EntityTypeBuilder<AcademicClass> builder)
    {
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        builder.Property(x => x.Order).IsRequired();
        builder.Property(x => x.TotalSeats).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.Shift).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}
