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

        public SubjectsController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirst("userId")!.Value);
        }

        // GET /api/subjects
        [HttpGet]
        public async Task<IActionResult> GetSubjects()
        {
            var userId = GetUserId();

            var subjects = await _context.Subjects
                .Where(s => s.UserId == userId)
                .Select(s => new SubjectResponse
                {
                    Id = s.Id,
                    Name = s.Name,
                    Color = s.Color,
                })
                .ToListAsync();

            return Ok(subjects);
        }

        // POST /api/subjects
        [HttpPost]
        public async Task<IActionResult> CreateSubject([FromBody] SubjectRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "Name is required" });
            }

            var subject = new Subject
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Color = request.Color,
                UserId = GetUserId(),
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

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

            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (subject == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(updated.Name))
            {
                return BadRequest(new { message = "Name is required" });
            }

            subject.Name = updated.Name;
            subject.Color = updated.Color;

            await _context.SaveChangesAsync();

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

            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (subject == null)
                return NotFound();

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}