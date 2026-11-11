using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Framework.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAcademicClassIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AcademicClass_Name",
                table: "AcademicClass");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AcademicClass_Name",
                table: "AcademicClass",
                column: "Name",
                unique: true);
        }
    }
}
