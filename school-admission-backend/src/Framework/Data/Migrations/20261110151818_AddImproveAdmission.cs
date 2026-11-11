using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Framework.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddImproveAdmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "ClassId",
                table: "AdmissionHold",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "WaitlistHoldMinutes",
                table: "Admission",
                type: "integer",
                nullable: false,
                defaultValue: 30);

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHold_StudentId",
                table: "AdmissionHold",
                column: "StudentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AdmissionHold_StudentId",
                table: "AdmissionHold");

            migrationBuilder.DropColumn(
                name: "WaitlistHoldMinutes",
                table: "Admission");

            migrationBuilder.AlterColumn<int>(
                name: "ClassId",
                table: "AdmissionHold",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");
        }
    }
}
