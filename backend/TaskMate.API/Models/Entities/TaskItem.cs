using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskMate.API.Models.Enums;
using TaskStatus = TaskMate.API.Models.Enums.TaskStatus;

namespace TaskMate.API.Models.Entities
{
    public class TaskItem
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }

        public int? EstimatedMinutes { get; set; }
        public bool IsPinned { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid? SubjectId { get; set; }
        public Subject? Subject { get; set; }

        public ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
    }
}