using TaskMate.API.Models.Entities;
using TaskMate.API.Models.Enums;

namespace TaskMate.API.Models.DTOs;

public class TaskItemResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime? Deadline { get; set; }
    public TaskMate.API.Models.Enums.TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsPinned { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid UserId { get; set; }
    public Guid? SubjectId { get; set; }
    public bool IsOverdue { get; set; }
    public bool IsDueToday { get; set; }

    public static TaskItemResponse From(TaskItem task, DateTime utcNow)
    {
        var todayUtc = utcNow.Date;
        var isDone = task.Status == TaskMate.API.Models.Enums.TaskStatus.Done;

        var isOverdue = false;
        var isDueToday = false;

        if (task.Deadline.HasValue && !isDone)
        {
            var deadlineDate = ToUtcDate(task.Deadline.Value);
            isOverdue = deadlineDate < todayUtc;
            isDueToday = deadlineDate == todayUtc;
        }

        return new TaskItemResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Deadline = task.Deadline,
            Status = task.Status,
            Priority = task.Priority,
            EstimatedMinutes = task.EstimatedMinutes,
            IsPinned = task.IsPinned,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            UserId = task.UserId,
            SubjectId = task.SubjectId,
            IsOverdue = isOverdue,
            IsDueToday = isDueToday
        };
    }

    private static DateTime ToUtcDate(DateTime value)
    {
        var utc = value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
        return utc.Date;
    }
}
