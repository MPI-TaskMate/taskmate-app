using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskMate.API.Data;
using TaskMate.API.Models.DTOs;
using TaskMate.API.Models.Entities;

using TaskStatus = TaskMate.API.Models.Enums.TaskStatus;
using TaskPriority = TaskMate.API.Models.Enums.TaskPriority;

namespace TaskMate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TasksController> _logger;

        public TasksController(
            AppDbContext context,
            ILogger<TasksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirst("userId")!.Value);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
        {
            var userId = GetUserId();

            _logger.LogInformation("Create task request for user {UserId}", userId);

            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                _logger.LogWarning("Create task failed because title is required for user {UserId}", userId);
                return BadRequest("Title is required");
            }

            if (dto.EstimatedMinutes.HasValue && dto.EstimatedMinutes.Value < 0)
            {
                _logger.LogWarning("Create task failed because estimatedMinutes is negative for user {UserId}", userId);
                return BadRequest("EstimatedMinutes must be greater than or equal to 0");
            }

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Deadline = dto.Deadline,
                Priority = dto.Priority,
                EstimatedMinutes = dto.EstimatedMinutes,
                SubjectId = dto.SubjectId,
                UserId = GetUserId(),
                Status = TaskStatus.Todo
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Task created successfully. TaskId: {TaskId}, UserId: {UserId}", task.Id, userId);

            return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? status = null,
            [FromQuery] string? priority = null,
            [FromQuery] string? subjectId = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? order = null)
        {
            var userId = GetUserId();

            if (!string.IsNullOrWhiteSpace(order) && string.IsNullOrWhiteSpace(sortBy))
            {
                _logger.LogWarning("GetAll tasks rejected: order without sortBy for user {UserId}", userId);
                return BadRequest("sortBy is required when order is specified.");
            }

            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                var s = sortBy.Trim();
                if (!s.Equals("deadline", StringComparison.OrdinalIgnoreCase)
                    && !s.Equals("priority", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("GetAll tasks rejected: invalid sortBy for user {UserId}", userId);
                    return BadRequest("sortBy must be deadline or priority.");
                }
            }

            if (!string.IsNullOrWhiteSpace(order))
            {
                var o = order.Trim();
                if (!o.Equals("asc", StringComparison.OrdinalIgnoreCase)
                    && !o.Equals("desc", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("GetAll tasks rejected: invalid order for user {UserId}", userId);
                    return BadRequest("order must be asc or desc.");
                }
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<TaskStatus>(status, true, out _))
                {
                    _logger.LogWarning("GetAll tasks rejected: invalid status for user {UserId}", userId);
                    return BadRequest("status must be Todo, InProgress, or Done.");
                }
            }

            if (!string.IsNullOrWhiteSpace(priority))
            {
                if (!Enum.TryParse<TaskPriority>(priority, true, out _))
                {
                    _logger.LogWarning("GetAll tasks rejected: invalid priority for user {UserId}", userId);
                    return BadRequest("priority must be Low, Medium, or High.");
                }
            }

            if (!string.IsNullOrWhiteSpace(subjectId))
            {
                if (!Guid.TryParse(subjectId, out _))
                {
                    _logger.LogWarning("GetAll tasks rejected: invalid subjectId for user {UserId}", userId);
                    return BadRequest("subjectId must be a valid GUID.");
                }
            }

            _logger.LogInformation("Fetching tasks for user {UserId}", userId);

            var query = _context.Tasks.AsQueryable().Where(t => t.UserId == userId);

            if (!string.IsNullOrWhiteSpace(status)
                && Enum.TryParse<TaskStatus>(status, true, out var statusFilter))
            {
                query = query.Where(t => t.Status == statusFilter);
            }

            if (!string.IsNullOrWhiteSpace(priority)
                && Enum.TryParse<TaskPriority>(priority, true, out var priorityFilter))
            {
                query = query.Where(t => t.Priority == priorityFilter);
            }

            if (!string.IsNullOrWhiteSpace(subjectId) && Guid.TryParse(subjectId, out var subjectGuid))
            {
                query = query.Where(t => t.SubjectId == subjectGuid);
            }

            var sortDescending = !string.IsNullOrWhiteSpace(order)
                && order!.Trim().Equals("desc", StringComparison.OrdinalIgnoreCase);

            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                var sortKey = sortBy.Trim();
                if (sortKey.Equals("deadline", StringComparison.OrdinalIgnoreCase))
                {
                    query = sortDescending
                        ? query.OrderBy(t => t.Deadline == null).ThenByDescending(t => t.Deadline)
                        : query.OrderBy(t => t.Deadline == null).ThenBy(t => t.Deadline);
                }
                else
                {
                    query = sortDescending
                        ? query.OrderByDescending(t => t.Priority)
                        : query.OrderBy(t => t.Priority);
                }
            }
            else
            {
                query = query.OrderByDescending(t => t.CreatedAt);
            }

            var tasks = await query.ToListAsync();

            var utcNow = DateTime.UtcNow;
            var response = tasks.Select(t => TaskItemResponse.From(t, utcNow)).ToList();

            _logger.LogInformation("Fetched {Count} tasks for user {UserId}", response.Count, userId);

            return Ok(response);
        }

        [HttpGet("stats")]
        [Authorize]
        public async Task<IActionResult> GetStats()
        {
            var userId = GetUserId();

            _logger.LogInformation("Fetching task completion stats for user {UserId}", userId);

            var byStatus = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.UserId == userId)
                .GroupBy(t => t.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var countByStatus = byStatus.ToDictionary(x => x.Status, x => x.Count);

            int CountFor(TaskStatus s) => countByStatus.GetValueOrDefault(s);

            var todo = CountFor(TaskStatus.Todo);
            var inProgress = CountFor(TaskStatus.InProgress);
            var done = CountFor(TaskStatus.Done);
            var total = todo + inProgress + done;

            var completionPercentage = total == 0 ? 0 : done * 100 / total;

            return Ok(new
            {
                total,
                done,
                inProgress,
                todo,
                completionPercentage
            });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var userId = GetUserId();

            _logger.LogInformation("Fetching task {TaskId} for user {UserId}", id, userId);

            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                _logger.LogWarning("Task {TaskId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            return Ok(task);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, UpdateTaskDto dto)
        {
            var userId = GetUserId();

            _logger.LogInformation("Update task request. TaskId: {TaskId}, UserId: {UserId}", id, userId);

            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                _logger.LogWarning("Update task failed. TaskId: {TaskId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                _logger.LogWarning("Update task failed because title is required. TaskId: {TaskId}, UserId: {UserId}", id, userId);
                return BadRequest("Title is required");
            }

            if (dto.EstimatedMinutes.HasValue && dto.EstimatedMinutes.Value < 0)
            {
                _logger.LogWarning("Update task failed because estimatedMinutes is negative. TaskId: {TaskId}, UserId: {UserId}", id, userId);
                return BadRequest("EstimatedMinutes must be greater than or equal to 0");
            }

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Deadline = dto.Deadline;
            task.Priority = dto.Priority;
            task.Status = dto.Status;
            task.EstimatedMinutes = dto.EstimatedMinutes;
            task.SubjectId = dto.SubjectId;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Task updated successfully. TaskId: {TaskId}, UserId: {UserId}", id, userId);

            return Ok(task);
        }

        [HttpPatch("{id}")]
        [Authorize]
        public async Task<IActionResult> Patch(Guid id, PatchTaskDto dto)
        {
            var userId = GetUserId();

            _logger.LogInformation("Patch task request. TaskId: {TaskId}, UserId: {UserId}", id, userId);

            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                _logger.LogWarning("Patch task failed. TaskId: {TaskId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            if (dto.Status.HasValue)
                task.Status = dto.Status.Value;

            if (dto.Priority.HasValue)
                task.Priority = dto.Priority.Value;

            if (dto.Deadline.HasValue)
                task.Deadline = dto.Deadline;

            if (dto.IsPinned.HasValue)
                task.IsPinned = dto.IsPinned.Value;

            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Task patched successfully. TaskId: {TaskId}, UserId: {UserId}", id, userId);

            return Ok(task);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();

            _logger.LogInformation("Delete task request. TaskId: {TaskId}, UserId: {UserId}", id, userId);

            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                _logger.LogWarning("Delete task failed. TaskId: {TaskId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Task deleted successfully. TaskId: {TaskId}, UserId: {UserId}", id, userId);

            return NoContent();
        }
    }
}