using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gixat.Web.Migrations
{
    /// <inheritdoc />
    public partial class AddJobCardCollaboration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JobCardComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCardId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Type = table.Column<int>(type: "integer", maxLength: 50, nullable: false),
                    MentionedUserIds = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    HasAttachment = table.Column<bool>(type: "boolean", nullable: false),
                    AttachmentUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AttachmentName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsResolved = table.Column<bool>(type: "boolean", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ParentCommentId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCardComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCardComments_JobCardComments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "JobCardComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobCardComments_JobCards_JobCardId",
                        column: x => x.JobCardId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobCardParts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCardItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCardId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    InventoryItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    PartNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PartName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    QuantityUsed = table.Column<decimal>(type: "numeric(10,3)", precision: 10, scale: 3, nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Markup = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Source = table.Column<int>(type: "integer", maxLength: 50, nullable: false),
                    Supplier = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SupplierPartNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "integer", maxLength: 50, nullable: false),
                    OrderedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InstalledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HasWarranty = table.Column<bool>(type: "boolean", nullable: false),
                    WarrantyMonths = table.Column<int>(type: "integer", nullable: false),
                    WarrantyInfo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    AddedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCardParts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCardParts_JobCardItems_JobCardItemId",
                        column: x => x.JobCardItemId,
                        principalTable: "JobCardItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_JobCardParts_JobCards_JobCardId",
                        column: x => x.JobCardId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobCardTimeEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCardItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCardId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    TechnicianId = table.Column<Guid>(type: "uuid", nullable: false),
                    TechnicianName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Hours = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsBillable = table.Column<bool>(type: "boolean", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BreakMinutes = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCardTimeEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCardTimeEntries_JobCardItems_JobCardItemId",
                        column: x => x.JobCardItemId,
                        principalTable: "JobCardItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_JobCardTimeEntries_JobCards_JobCardId",
                        column: x => x.JobCardId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobCardComments_AuthorId",
                table: "JobCardComments",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardComments_CompanyId",
                table: "JobCardComments",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardComments_CreatedAt",
                table: "JobCardComments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardComments_JobCardId",
                table: "JobCardComments",
                column: "JobCardId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardComments_ParentCommentId",
                table: "JobCardComments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardParts_CompanyId",
                table: "JobCardParts",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardParts_InventoryItemId",
                table: "JobCardParts",
                column: "InventoryItemId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardParts_JobCardId",
                table: "JobCardParts",
                column: "JobCardId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardParts_JobCardItemId",
                table: "JobCardParts",
                column: "JobCardItemId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardParts_PartNumber",
                table: "JobCardParts",
                column: "PartNumber");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardParts_Status",
                table: "JobCardParts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardTimeEntries_CompanyId",
                table: "JobCardTimeEntries",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardTimeEntries_IsActive",
                table: "JobCardTimeEntries",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardTimeEntries_JobCardId",
                table: "JobCardTimeEntries",
                column: "JobCardId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardTimeEntries_JobCardItemId",
                table: "JobCardTimeEntries",
                column: "JobCardItemId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardTimeEntries_StartTime",
                table: "JobCardTimeEntries",
                column: "StartTime");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardTimeEntries_TechnicianId",
                table: "JobCardTimeEntries",
                column: "TechnicianId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobCardComments");

            migrationBuilder.DropTable(
                name: "JobCardParts");

            migrationBuilder.DropTable(
                name: "JobCardTimeEntries");
        }
    }
}
