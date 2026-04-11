using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskMate.API.Data;
using TaskMate.API.Models.DTOs;
using TaskMate.API.Models.Entities;

namespace TaskMate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SubjectsController> _logger;

        public SubjectsController(
            AppDbContext context,
            ILogger<SubjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirst("userId")!.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetSubjects()
        {
            var userId = GetUserId();

            _logger.LogInformation("Fetching subjects for user {UserId}", userId);

            var subjects = await _context.Subjects
                .Where(s => s.UserId == userId)
                .Select(s => new SubjectResponse
                {
                    Id = s.Id,
                    Name = s.Name,
                    Color = s.Color,
                })
                .ToListAsync();

            _logger.LogInformation("Fetched {Count} subjects for user {UserId}", subjects.Count, userId);

            return Ok(subjects);
        }

        // POST /api/subjects
        [HttpPost]
        public async Task<IActionResult> CreateSubject([FromBody] SubjectRequest request)
        {
            var userId = GetUserId();

            _logger.LogInformation("Create subject request for user {UserId}", userId);

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                _logger.LogWarning("Create subject failed because name is required for user {UserId}", userId);
                return BadRequest(new { message = "Name is required" });
            }

            var subject = new Subject
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Color = request.Color,
                UserId = userId,
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Subject created successfully. SubjectId: {SubjectId}, UserId: {UserId}",
                subject.Id,
                userId);

            return StatusCode(201, new SubjectResponse
            {
                Id = subject.Id,
                Name = subject.Name,
                Color = subject.Color,
            });
        }
        
        // PUT /api/subjects/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] Subject updated)
        {
            var userId = GetUserId();

            _logger.LogInformation("Update subject request. SubjectId: {SubjectId}, UserId: {UserId}", id, userId);

            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (subject == null)
            {
                _logger.LogWarning("Update subject failed. SubjectId: {SubjectId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(updated.Name))
            {
                _logger.LogWarning("Update subject failed because name is required. SubjectId: {SubjectId}, UserId: {UserId}", id, userId);
                return BadRequest(new { message = "Name is required" });
            }

            subject.Name = updated.Name;
            subject.Color = updated.Color;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subject updated successfully. SubjectId: {SubjectId}, UserId: {UserId}", id, userId);

            return Ok(new SubjectResponse
            {
                Id = subject.Id,
                Name = subject.Name,
                Color = subject.Color,
            });
        }

        // DELETE /api/subjects/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubject(Guid id)
        {
            var userId = GetUserId();

            _logger.LogInformation("Delete subject request. SubjectId: {SubjectId}, UserId: {UserId}", id, userId);

            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (subject == null)
            {
                _logger.LogWarning("Delete subject failed. SubjectId: {SubjectId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Subject deleted successfully. SubjectId: {SubjectId}, UserId: {UserId}", id, userId);

            return NoContent();
        }
    }
}