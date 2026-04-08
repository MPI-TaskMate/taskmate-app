using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskMate.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DueDate",
                table: "Tasks",
                newName: "Deadline");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_DueDate",
                table: "Tasks",
                newName: "IX_Tasks_Deadline");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Tasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Tasks");

            migrationBuilder.RenameColumn(
                name: "Deadline",
                table: "Tasks",
                newName: "DueDate");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_Deadline",
                table: "Tasks",
                newName: "IX_Tasks_DueDate");
        }
    }
}
