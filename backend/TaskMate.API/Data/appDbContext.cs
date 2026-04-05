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

        public DbSet<User> Users => Set<User>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<Tag> Tags => Set<Tag>();
        public DbSet<TaskTag> TaskTags => Set<TaskTag>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TaskTag>()
                .HasKey(tt => new { tt.TaskId, tt.TagId });

            modelBuilder.Entity<TaskTag>()
                .HasOne(tt => tt.Task)
                .WithMany(t => t.TaskTags)
                .HasForeignKey(tt => tt.TaskId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TaskTag>()
                .HasOne(tt => tt.Tag)
                .WithMany(t => t.TaskTags)
                .HasForeignKey(tt => tt.TagId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TaskItem>()
                .HasIndex(t => t.DueDate);

            modelBuilder.Entity<TaskItem>()
                .HasIndex(t => t.Status);

            modelBuilder.Entity<TaskItem>()
                .HasIndex(t => t.Priority);

            modelBuilder.Entity<Subject>()
                .HasIndex(s => new { s.UserId, s.Name })
                .IsUnique(false);

            modelBuilder.Entity<Tag>()
                .HasIndex(t => new { t.UserId, t.Name })
                .IsUnique(false);
        }
    }
}
