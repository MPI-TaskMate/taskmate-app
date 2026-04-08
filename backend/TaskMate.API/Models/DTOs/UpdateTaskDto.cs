using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskMate.API.Models.Enums;
using TaskStatus = TaskMate.API.Models.Enums.TaskStatus;
using TaskPriority = TaskMate.API.Models.Enums.TaskPriority;

namespace TaskMate.API.Models.DTOs
{
public class UpdateTaskDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime? Deadline { get; set; }
    public TaskPriority Priority { get; set; }
    public TaskStatus Status { get; set; }
    public Guid? SubjectId { get; set; }
}
}