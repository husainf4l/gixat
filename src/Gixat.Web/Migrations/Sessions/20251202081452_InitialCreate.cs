using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gixat.Web.Migrations.Sessions
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GarageSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientVehicleId = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    MileageIn = table.Column<int>(type: "integer", nullable: true),
                    MileageOut = table.Column<int>(type: "integer", nullable: true),
                    CheckInAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CheckOutAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedCompletionAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ServiceAdvisorId = table.Column<Guid>(type: "uuid", nullable: true),
                    TechnicianId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GarageSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CustomerConcerns = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    RequestedServices = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerRequests_GarageSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "GarageSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Inspections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    InspectorId = table.Column<Guid>(type: "uuid", nullable: true),
                    InspectionStartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InspectionCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExteriorCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    InteriorCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    EngineCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TransmissionCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BrakeCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TireCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SuspensionCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ElectricalCondition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    FluidLevels = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Findings = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Recommendations = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    OverallPriority = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inspections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inspections_GarageSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "GarageSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobCards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCardNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    EstimatedStartAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedCompletionAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualStartAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualCompletionAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedHours = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ActualHours = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    SupervisorId = table.Column<Guid>(type: "uuid", nullable: true),
                    PrimaryTechnicianId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovalNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CustomerAuthorized = table.Column<bool>(type: "boolean", nullable: false),
                    CustomerAuthorizedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerAuthorizationMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerAuthorizationNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    WorkSummary = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    TechnicianNotes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    QualityNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    InternalNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCards_GarageSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "GarageSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TestDrives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DriverId = table.Column<Guid>(type: "uuid", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MileageStart = table.Column<int>(type: "integer", nullable: true),
                    MileageEnd = table.Column<int>(type: "integer", nullable: true),
                    RouteDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    EnginePerformance = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TransmissionPerformance = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BrakePerformance = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SteeringPerformance = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SuspensionPerformance = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    NoiseObservations = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    VibrationObservations = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ElectricalObservations = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    AcPerformance = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Findings = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Recommendations = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    OverallPriority = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestDrives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestDrives_GarageSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "GarageSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InspectionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InspectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ItemName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Condition = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    RequiresAttention = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InspectionItems_Inspections_InspectionId",
                        column: x => x.InspectionId,
                        principalTable: "Inspections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobCardItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCardId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: true),
                    TechnicianId = table.Column<Guid>(type: "uuid", nullable: true),
                    EstimatedHours = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ActualHours = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WorkPerformed = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    TechnicianNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    QualityCheckNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    QualityChecked = table.Column<bool>(type: "boolean", nullable: false),
                    QualityCheckedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    QualityCheckedById = table.Column<Guid>(type: "uuid", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCardItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCardItems_JobCards_JobCardId",
                        column: x => x.JobCardId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MediaItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    S3Key = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    S3Bucket = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    S3Url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    MediaType = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    CustomerRequestId = table.Column<Guid>(type: "uuid", nullable: true),
                    InspectionId = table.Column<Guid>(type: "uuid", nullable: true),
                    TestDriveId = table.Column<Guid>(type: "uuid", nullable: true),
                    JobCardId = table.Column<Guid>(type: "uuid", nullable: true),
                    JobCardItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    ThumbnailS3Key = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MediaItems_CustomerRequests_CustomerRequestId",
                        column: x => x.CustomerRequestId,
                        principalTable: "CustomerRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MediaItems_GarageSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "GarageSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MediaItems_Inspections_InspectionId",
                        column: x => x.InspectionId,
                        principalTable: "Inspections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MediaItems_JobCardItems_JobCardItemId",
                        column: x => x.JobCardItemId,
                        principalTable: "JobCardItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MediaItems_JobCards_JobCardId",
                        column: x => x.JobCardId,
                        principalTable: "JobCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MediaItems_TestDrives_TestDriveId",
                        column: x => x.TestDriveId,
                        principalTable: "TestDrives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRequests_CompanyId",
                table: "CustomerRequests",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRequests_SessionId",
                table: "CustomerRequests",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRequests_Status",
                table: "CustomerRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_BranchId",
                table: "GarageSessions",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_ClientId",
                table: "GarageSessions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_ClientVehicleId",
                table: "GarageSessions",
                column: "ClientVehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_CompanyId",
                table: "GarageSessions",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_CompanyId_SessionNumber",
                table: "GarageSessions",
                columns: new[] { "CompanyId", "SessionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_SessionNumber",
                table: "GarageSessions",
                column: "SessionNumber");

            migrationBuilder.CreateIndex(
                name: "IX_GarageSessions_Status",
                table: "GarageSessions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionItems_InspectionId",
                table: "InspectionItems",
                column: "InspectionId");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_CompanyId",
                table: "Inspections",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_SessionId",
                table: "Inspections",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_Status",
                table: "Inspections",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardItems_CompanyId",
                table: "JobCardItems",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardItems_JobCardId",
                table: "JobCardItems",
                column: "JobCardId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCardItems_Status",
                table: "JobCardItems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_CompanyId",
                table: "JobCards",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_CompanyId_JobCardNumber",
                table: "JobCards",
                columns: new[] { "CompanyId", "JobCardNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_JobCardNumber",
                table: "JobCards",
                column: "JobCardNumber");

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_SessionId",
                table: "JobCards",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobCards_Status",
                table: "JobCards",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_Category",
                table: "MediaItems",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_CompanyId",
                table: "MediaItems",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_CustomerRequestId",
                table: "MediaItems",
                column: "CustomerRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_InspectionId",
                table: "MediaItems",
                column: "InspectionId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_JobCardId",
                table: "MediaItems",
                column: "JobCardId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_JobCardItemId",
                table: "MediaItems",
                column: "JobCardItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_MediaType",
                table: "MediaItems",
                column: "MediaType");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_S3Key",
                table: "MediaItems",
                column: "S3Key");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_SessionId",
                table: "MediaItems",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_TestDriveId",
                table: "MediaItems",
                column: "TestDriveId");

            migrationBuilder.CreateIndex(
                name: "IX_TestDrives_CompanyId",
                table: "TestDrives",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_TestDrives_SessionId",
                table: "TestDrives",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TestDrives_Status",
                table: "TestDrives",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InspectionItems");

            migrationBuilder.DropTable(
                name: "MediaItems");

            migrationBuilder.DropTable(
                name: "CustomerRequests");

            migrationBuilder.DropTable(
                name: "Inspections");

            migrationBuilder.DropTable(
                name: "JobCardItems");

            migrationBuilder.DropTable(
                name: "TestDrives");

            migrationBuilder.DropTable(
                name: "JobCards");

            migrationBuilder.DropTable(
                name: "GarageSessions");
        }
    }
}
