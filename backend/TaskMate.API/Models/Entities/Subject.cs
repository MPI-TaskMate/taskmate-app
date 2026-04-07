using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TaskMate.API.Models.Entities
{
    public class Subject
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}