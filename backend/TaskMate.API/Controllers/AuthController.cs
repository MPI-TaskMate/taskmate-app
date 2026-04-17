using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskMate.API.Data;
using TaskMate.API.Models.DTOs;
using TaskMate.API.Models.Entities;
using TaskMate.API.Services;

namespace TaskMate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtTokenService _jwtTokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            AppDbContext context,
            JwtTokenService jwtTokenService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            _logger.LogInformation("Register attempt for email: {Email}", request.Email);

            if (string.IsNullOrWhiteSpace(request.Email) ||
                !request.Email.Contains('@') ||
                request.Email.LastIndexOf('@') == request.Email.Length - 1)
            {
                _logger.LogWarning("Register failed because of invalid email format for email: {Email}", request.Email);
                return BadRequest(new { message = "Invalid email format." });
            }

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            {
                _logger.LogWarning("Register failed because of invalid password length for email: {Email}", request.Email);
                return BadRequest(new { message = "Password must be at least 8 characters long." });
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var emailExists = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);
            if (emailExists)
            {
                _logger.LogWarning("Register failed because email already exists: {Email}", normalizedEmail);
                return BadRequest(new { message = "Email already exists." });
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = normalizedEmail,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "User registered successfully. UserId: {UserId}, Email: {Email}",
                user.Id,
                user.Email);

            var token = _jwtTokenService.GenerateToken(user);

            return StatusCode(201, new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);

            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                _logger.LogWarning("Login failed because email or password was missing.");
                return BadRequest(new { message = "Email and password are required." });
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed for email: {Email}", normalizedEmail);
                return Unauthorized(new { message = "Invalid email or password" });
            }

            _logger.LogInformation(
                "Login successful. UserId: {UserId}, Email: {Email}",
                user.Id,
                user.Email);

            var token = _jwtTokenService.GenerateToken(user);

            return Ok(new { token });
        }
    }
}