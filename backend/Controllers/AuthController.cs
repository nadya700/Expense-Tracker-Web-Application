using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ExpenseTrackerApi.Data;
using ExpenseTrackerApi.DTOs;
using ExpenseTrackerApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ExpenseTrackerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null)
        {
            return Unauthorized(new { message = "İstifadəçi tapılmadı və ya şifrə yanlışdır" });
        }

        // Verify password hash
        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "İstifadəçi tapılmadı və ya şifrə yanlışdır" });
        }

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Currency = user.Currency,
            MonthlyBudget = user.MonthlyBudget,
            BudgetWarningThreshold = user.BudgetWarningThreshold,
            EnableBudgetAlerts = user.EnableBudgetAlerts
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
        {
            return BadRequest(new { message = "Bu e-poçt ünvanı ilə artıq qeydiyyat mövcuddur" });
        }

        var user = new User
        {
            Id = "usr-" + Guid.NewGuid().ToString("N")[..8],
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = HashPassword(request.Password),
            Currency = request.Currency ?? "₼",
            MonthlyBudget = request.MonthlyBudget ?? 1500m,
            BudgetWarningThreshold = 80,
            EnableBudgetAlerts = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Currency = user.Currency,
            MonthlyBudget = user.MonthlyBudget,
            BudgetWarningThreshold = user.BudgetWarningThreshold,
            EnableBudgetAlerts = user.EnableBudgetAlerts
        });
    }

    [Authorize]
    [HttpPut("budget")]
    public async Task<IActionResult> UpdateBudget([FromBody] UpdateBudgetDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "İstifadəçi tapılmadı" });
        }

        user.MonthlyBudget = dto.MonthlyBudget;
        user.BudgetWarningThreshold = dto.BudgetWarningThreshold;
        user.EnableBudgetAlerts = dto.EnableBudgetAlerts;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Büdcə parametrləri uğurla yeniləndi", user.MonthlyBudget, user.BudgetWarningThreshold });
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "SuperSecretKeyForExpenseTracker2026!With32CharsMin";
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.Name),
            new Claim("currency", user.Currency),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ExpenseTrackerApi",
            audience: _configuration["Jwt:Audience"] ?? "ExpenseTrackerClient",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "Salt2026_Expense"));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        // For development/seed user allow direct match or hashed match
        if (storedHash.Contains("Placeholder") || storedHash == password)
            return true;

        return HashPassword(password) == storedHash;
    }
}
