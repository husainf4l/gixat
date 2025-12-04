using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gixat.Web.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionCompositeIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_CompanyId_CheckInAt",
                table: "GarageSessions",
                columns: new[] { "CompanyId", "CheckInAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_CompanyId_Status_CheckInAt",
                table: "GarageSessions",
                columns: new[] { "CompanyId", "Status", "CheckInAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GarageSessions_CompanyId_CheckInAt",
                table: "GarageSessions");

            migrationBuilder.DropIndex(
                name: "IX_GarageSessions_CompanyId_Status_CheckInAt",
                table: "GarageSessions");
        }
    }
}
