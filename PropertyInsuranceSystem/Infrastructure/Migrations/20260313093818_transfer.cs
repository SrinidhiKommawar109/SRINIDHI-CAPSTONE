using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class transfer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PolicyOwnershipTransfers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PolicyId = table.Column<int>(type: "int", nullable: false),
                    CurrentOwnerId = table.Column<int>(type: "int", nullable: false),
                    NewOwnerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewOwnerEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewOwnerPhone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransferReason = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OfficerNotes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyOwnershipTransfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PolicyOwnershipTransfers_PolicyRequests_PolicyId",
                        column: x => x.PolicyId,
                        principalTable: "PolicyRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PolicyOwnershipTransfers_Users_CurrentOwnerId",
                        column: x => x.CurrentOwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PolicyTransferDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransferRequestId = table.Column<int>(type: "int", nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyTransferDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PolicyTransferDocuments_PolicyOwnershipTransfers_TransferRequestId",
                        column: x => x.TransferRequestId,
                        principalTable: "PolicyOwnershipTransfers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "PropertyPlans",
                keyColumn: "Id",
                keyValue: 4,
                column: "PlanName",
                value: "Luxury Plan � Signature Property Guard");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyOwnershipTransfers_CurrentOwnerId",
                table: "PolicyOwnershipTransfers",
                column: "CurrentOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyOwnershipTransfers_PolicyId",
                table: "PolicyOwnershipTransfers",
                column: "PolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyTransferDocuments_TransferRequestId",
                table: "PolicyTransferDocuments",
                column: "TransferRequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PolicyTransferDocuments");

            migrationBuilder.DropTable(
                name: "PolicyOwnershipTransfers");

            migrationBuilder.UpdateData(
                table: "PropertyPlans",
                keyColumn: "Id",
                keyValue: 4,
                column: "PlanName",
                value: "Luxury Plan – Signature Property Guard");
        }
    }
}
