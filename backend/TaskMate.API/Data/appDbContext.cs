using Microsoft.EntityFrameworkCore;
using TaskMate.API.Models.Entities;

namespace TaskMate.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<User> Users => Set<User>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<Tag> Tags => Set<Tag>();
        public DbSet<TaskTag> TaskTags => Set<TaskTag>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ================= USER =================
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.PasswordHash)
                    .IsRequired();

                entity.Property(u => u.CreatedAt)
                    .IsRequired();

                entity.HasIndex(u => u.Email)
                    .IsUnique();

                entity.HasMany(u => u.Subjects)
                    .WithOne(s => s.User)
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Tasks)
                    .WithOne(t => t.User)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Tags)
                    .WithOne(t => t.User)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ================= SUBJECT =================
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.HasKey(s => s.Id);

                entity.Property(s => s.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(s => s.Color)
                    .HasMaxLength(20);

                entity.HasIndex(s => new { s.UserId, s.Name });

                entity.HasOne(s => s.User)
                    .WithMany(u => u.Subjects)
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(s => s.Tasks)
                    .WithOne(t => t.Subject)
                    .HasForeignKey(t => t.SubjectId)
                    .OnDelete(DeleteBehavior.SetNull); // 🔥 important
            });

            // ================= TASK =================
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(t => t.Id);

                entity.Property(t => t.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(t => t.Description)
                    .HasMaxLength(1000);

                entity.Property(t => t.CreatedAt)
                    .IsRequired();

                entity.HasIndex(t => t.Deadline);
                entity.HasIndex(t => t.Status);
                entity.HasIndex(t => t.Priority);

                entity.HasOne(t => t.User)
                    .WithMany(u => u.Tasks)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.Subject)
                    .WithMany(s => s.Tasks)
                    .HasForeignKey(t => t.SubjectId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // ================= TAG =================
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(t => t.Id);

                entity.Property(t => t.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(t => new { t.UserId, t.Name });

                entity.HasOne(t => t.User)
                    .WithMany(u => u.Tags)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ================= TASK TAG (MANY-TO-MANY) =================
            modelBuilder.Entity<TaskTag>(entity =>
            {
                entity.HasKey(tt => new { tt.TaskId, tt.TagId });

                entity.HasOne(tt => tt.Task)
                    .WithMany(t => t.TaskTags)
                    .HasForeignKey(tt => tt.TaskId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(tt => tt.Tag)
                    .WithMany(t => t.TaskTags)
                    .HasForeignKey(tt => tt.TagId)
                    .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}