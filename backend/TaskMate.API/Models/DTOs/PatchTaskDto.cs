using System;
using System.Collections.Generic;
using System.Linq;
using TaskMate.API.Models.Enums;
using TaskStatus = TaskMate.API.Models.Enums.TaskStatus;
using TaskPriority = TaskMate.API.Models.Enums.TaskPriority;

namespace TaskMate.API.Models.DTOs
{
public class PatchTaskDto
{
    public TaskStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public DateTime? Deadline { get; set; }
    public bool? IsPinned { get; set; }
}
}