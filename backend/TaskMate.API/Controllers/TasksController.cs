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

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Deadline = dto.Deadline,
                Priority = dto.Priority,
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
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();

            _logger.LogInformation("Fetching tasks for user {UserId}", userId);

            var tasks = await _context.Tasks
                .Where(t => t.UserId == userId)
                .ToListAsync();

            _logger.LogInformation("Fetched {Count} tasks for user {UserId}", tasks.Count, userId);

            return Ok(tasks);
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

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Deadline = dto.Deadline;
            task.Priority = dto.Priority;
            task.Status = dto.Status;
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