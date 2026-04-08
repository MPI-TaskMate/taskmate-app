using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskMate.API.Models.Enums;

namespace TaskMate.API.Models.DTOs
{
public class CreateTaskDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime? Deadline { get; set; }
    public TaskPriority Priority { get; set; }
    public Guid? SubjectId { get; set; }
}
}