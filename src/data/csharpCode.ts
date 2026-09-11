import { CSharpSourceFile } from '../types';

export const CSHARP_FILES: CSharpSourceFile[] = [
  {
    id: 'program_cs',
    fileName: 'Program.cs',
    folder: 'Root',
    description: 'Entry point, DI container, EF Core, JWT Auth, CORS, and Swagger UI',
    descriptionAz: 'Giriş nöqtəsi, asılılıq inyeksiyası (DI), EF Core, JWT təsdiqi və Swagger',
    language: 'csharp',
    code: `using System.Text;
using ExpenseTrackerApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Entity Framework Core with SQLite / SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=expensetracker.db"));

// 2. Configure JWT Authentication (Step 5: Authentication)
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForExpenseTracker2026!With32CharsMin";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ExpenseTrackerApi",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ExpenseTrackerClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// 3. Configure CORS to allow React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 4. Swagger Documentation with Bearer Token support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Expense Tracker Web API (C# .NET 8)", 
        Version = "v1",
        Description = "Task 3 - RESTful API for Expense Tracking, Income Management, and Financial Reports"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \\"Authorization: Bearer {token}\\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Ensure Database is created and seeded (Step 3: Store records)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
`,
  },
  {
    id: 'expenses_controller',
    fileName: 'ExpensesController.cs',
    folder: 'Controllers',
    description: 'Step 2 & 4: RESTful API for managing expenses, income, summaries, and reports',
    descriptionAz: 'Addım 2 & 4: Xərclər, gəlirlər və maliyyə hesabatlarını idarə edən RESTful API',
    language: 'csharp',
    code: `using System.Security.Claims;
using ExpenseTrackerApi.Data;
using ExpenseTrackerApi.DTOs;
using ExpenseTrackerApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires valid JWT Token
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(AppDbContext context, ILogger<ExpensesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "usr-1";

    // GET: api/expenses (Step 2: List & Filter Expenses)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseResponseDto>>> GetExpenses(
        [FromQuery] string? type, 
        [FromQuery] string? category, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] string? search)
    {
        var userId = GetUserId();
        var query = _context.Expenses.Where(e => e.UserId == userId);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(e => e.Type.ToLower() == type.ToLower());

        if (!string.IsNullOrEmpty(category))
            query = query.Where(e => e.Category.ToLower() == category.ToLower());

        if (startDate.HasValue)
            query = query.Where(e => e.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(e => e.Date <= endDate.Value);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(e => e.Title.Contains(search) || (e.Notes != null && e.Notes.Contains(search)));

        var items = await query.OrderByDescending(e => e.Date)
            .Select(e => new ExpenseResponseDto
            {
                Id = e.Id,
                Title = e.Title,
                Amount = e.Amount,
                Type = e.Type,
                Category = e.Category,
                Date = e.Date.ToString("yyyy-MM-dd"),
                PaymentMethod = e.PaymentMethod,
                Notes = e.Notes,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    // GET: api/expenses/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseResponseDto>> GetExpenseById(string id)
    {
        var userId = GetUserId();
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return NotFound(new { message = "Qeyd tapılmadı" });

        return Ok(new ExpenseResponseDto
        {
            Id = expense.Id,
            Title = expense.Title,
            Amount = expense.Amount,
            Type = expense.Type,
            Category = expense.Category,
            Date = expense.Date.ToString("yyyy-MM-dd"),
            PaymentMethod = expense.PaymentMethod,
            Notes = expense.Notes,
            CreatedAt = expense.CreatedAt
        });
    }

    // POST: api/expenses (Step 2: Add Record)
    [HttpPost]
    public async Task<ActionResult<ExpenseResponseDto>> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        var expense = new Expense
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            Title = dto.Title,
            Amount = dto.Amount,
            Type = dto.Type.ToLower(),
            Category = dto.Category,
            Date = DateTime.Parse(dto.Date),
            PaymentMethod = dto.PaymentMethod ?? "cash",
            Notes = dto.Notes,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExpenseById), new { id = expense.Id }, new ExpenseResponseDto
        {
            Id = expense.Id,
            Title = expense.Title,
            Amount = expense.Amount,
            Type = expense.Type,
            Category = expense.Category,
            Date = expense.Date.ToString("yyyy-MM-dd"),
            PaymentMethod = expense.PaymentMethod,
            Notes = expense.Notes,
            CreatedAt = expense.CreatedAt
        });
    }

    // PUT: api/expenses/{id} (Step 2: Update Record)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(string id, [FromBody] UpdateExpenseDto dto)
    {
        var userId = GetUserId();
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return NotFound(new { message = "Məlumat tapılmadı" });

        expense.Title = dto.Title;
        expense.Amount = dto.Amount;
        expense.Type = dto.Type.ToLower();
        expense.Category = dto.Category;
        expense.Date = DateTime.Parse(dto.Date);
        expense.PaymentMethod = dto.PaymentMethod ?? expense.PaymentMethod;
        expense.Notes = dto.Notes;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/expenses/{id} (Step 2: Delete Record)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(string id)
    {
        var userId = GetUserId();
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return NotFound(new { message = "Qeyd tapılmadı" });

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Uğurla silindi" });
    }

    // GET: api/expenses/summary (Step 4: Financial Summary)
    [HttpGet("summary")]
    public async Task<ActionResult<FinancialSummaryDto>> GetFinancialSummary()
    {
        var userId = GetUserId();
        var userExpenses = await _context.Expenses.Where(e => e.UserId == userId).ToListAsync();

        var totalIncome = userExpenses.Where(e => e.Type == "income").Sum(e => e.Amount);
        var totalExpense = userExpenses.Where(e => e.Type == "expense").Sum(e => e.Amount);
        var netBalance = totalIncome - totalExpense;
        var savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        var topCategory = userExpenses.Where(e => e.Type == "expense")
            .GroupBy(e => e.Category)
            .OrderByDescending(g => g.Sum(x => x.Amount))
            .Select(g => g.Key)
            .FirstOrDefault() ?? "N/A";

        return Ok(new FinancialSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            NetBalance = netBalance,
            SavingsRate = Math.Round(savingsRate, 1),
            IncomeCount = userExpenses.Count(e => e.Type == "income"),
            ExpenseCount = userExpenses.Count(e => e.Type == "expense"),
            TopExpenseCategory = topCategory
        });
    }
}
`,
  },
  {
    id: 'auth_controller',
    fileName: 'AuthController.cs',
    folder: 'Controllers',
    description: 'Step 5: User authentication, JWT issuance, and login/register endpoints',
    descriptionAz: 'Addım 5: İstifadəçi autentifikasiyası, JWT token yaradılması və giriş/qeydiyyat',
    language: 'csharp',
    code: `using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ExpenseTrackerApi.Data;
using ExpenseTrackerApi.DTOs;
using ExpenseTrackerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ExpenseTrackerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
        {
            return BadRequest(new { message = "Bu e-poçt ünvanı artıq qeydiyyatdan keçib." });
        }

        var user = new User
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            Name = dto.Name,
            Email = dto.Email.ToLower(),
            PasswordHash = HashPassword(dto.Password),
            Currency = dto.Currency ?? "₼",
            MonthlyBudget = dto.MonthlyBudget > 0 ? dto.MonthlyBudget : 1500,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Currency = user.Currency,
                MonthlyBudget = user.MonthlyBudget
            }
        });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "E-poçt və ya şifrə yanlışdır." });
        }

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Currency = user.Currency,
                MonthlyBudget = user.MonthlyBudget
            }
        });
    }

    private string GenerateJwtToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "SuperSecretKeyForExpenseTracker2026!With32CharsMin");
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _config["Jwt:Issuer"] ?? "ExpenseTrackerApi",
            Audience = _config["Jwt:Audience"] ?? "ExpenseTrackerClient",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private static bool VerifyPassword(string inputPassword, string storedHash)
    {
        return HashPassword(inputPassword) == storedHash;
    }
}
`,
  },
  {
    id: 'models_expense',
    fileName: 'Expense.cs',
    folder: 'Models',
    description: 'Expense and Income entity schema for Entity Framework Core',
    descriptionAz: 'EF Core üçün Xərc və Gəlir məlumat bazası modeli',
    language: 'csharp',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTrackerApi.Models;

[Table("Expenses")]
public class Expense
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "expense"; // "income" or "expense"

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "food";

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "cash";

    [MaxLength(500)]
    public string? Notes { get; set; }

    [Required]
    [MaxLength(50)]
    public string UserId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public User? User { get; set; }
}
`,
  },
  {
    id: 'models_user',
    fileName: 'User.cs',
    folder: 'Models',
    description: 'User entity schema for authentication and multi-user isolation',
    descriptionAz: 'Autentifikasiya və istifadəçi izolyasiyası üçün User modeli',
    language: 'csharp',
    code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTrackerApi.Models;

[Table("Users")]
public class User
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Currency { get; set; } = "₼";

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyBudget { get; set; } = 1500;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
`,
  },
  {
    id: 'app_db_context',
    fileName: 'AppDbContext.cs',
    folder: 'Data',
    description: 'Step 3: Entity Framework Core database context and seed data configuration',
    descriptionAz: 'Addım 3: Entity Framework Core məlumat bazası konteksti və ilkin məlumatlar',
    language: 'csharp',
    code: `using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure indexes for rapid queries
        modelBuilder.Entity<Expense>()
            .HasIndex(e => new { e.UserId, e.Date });

        modelBuilder.Entity<Expense>()
            .HasIndex(e => new { e.UserId, e.Type });

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Seed initial demo data
        var defaultUserId = "usr-1";
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = defaultUserId,
            Name = "Aydan Şərifova",
            Email = "sharifovaydan700@gmail.com",
            PasswordHash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // password123
            Currency = "₼",
            MonthlyBudget = 1500,
            CreatedAt = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        modelBuilder.Entity<Expense>().HasData(
            new Expense
            {
                Id = "tx-1",
                Title = "Aylıq Əsas Əməkhaqqı (Salary)",
                Amount = 2200,
                Type = "income",
                Category = "salary",
                Date = new DateTime(2026, 9, 1),
                PaymentMethod = "bank_transfer",
                Notes = "Şirkətdən aylıq köçürmə",
                UserId = defaultUserId,
                CreatedAt = new DateTime(2026, 9, 1, 9, 0, 0, DateTimeKind.Utc)
            },
            new Expense
            {
                Id = "tx-2",
                Title = "Mənzil Kirayəsi (Rent)",
                Amount = 550,
                Type = "expense",
                Category = "housing",
                Date = new DateTime(2026, 9, 2),
                PaymentMethod = "bank_transfer",
                Notes = "Sentyabr kirayəsi",
                UserId = defaultUserId,
                CreatedAt = new DateTime(2026, 9, 2, 10, 30, 0, DateTimeKind.Utc)
            }
        );
    }
}
`,
  },
  {
    id: 'dtos',
    fileName: 'ExpenseDtos.cs',
    folder: 'DTOs',
    description: 'Data Transfer Objects (DTOs) for strong typing and API contracts',
    descriptionAz: 'Məlumat ötürmə obyektləri (DTO) və güclü tiplər',
    language: 'csharp',
    code: `using System.ComponentModel.DataAnnotations;

namespace ExpenseTrackerApi.DTOs;

public record CreateExpenseDto(
    [Required, MaxLength(200)] string Title,
    [Range(0.01, 10000000)] decimal Amount,
    [Required] string Type, // "income" or "expense"
    [Required] string Category,
    [Required] string Date, // yyyy-MM-dd
    string? PaymentMethod,
    string? Notes
);

public record UpdateExpenseDto(
    [Required, MaxLength(200)] string Title,
    [Range(0.01, 10000000)] decimal Amount,
    [Required] string Type,
    [Required] string Category,
    [Required] string Date,
    string? PaymentMethod,
    string? Notes
);

public record ExpenseResponseDto
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Date { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record FinancialSummaryDto
{
    public decimal TotalIncome { get; init; }
    public decimal TotalExpense { get; init; }
    public decimal NetBalance { get; init; }
    public decimal SavingsRate { get; init; }
    public int IncomeCount { get; init; }
    public int ExpenseCount { get; init; }
    public string TopExpenseCategory { get; init; } = string.Empty;
}

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record RegisterDto(
    [Required] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    string? Currency,
    decimal MonthlyBudget
);

public record AuthResponseDto
{
    public string Token { get; init; } = string.Empty;
    public UserDto User { get; init; } = default!;
}

public record UserDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Currency { get; init; } = "₼";
    public decimal MonthlyBudget { get; init; }
}
`,
  },
  {
    id: 'appsettings_json',
    fileName: 'appsettings.json',
    folder: 'Configuration',
    description: 'Connection strings, logging levels, and JWT secret settings',
    descriptionAz: 'Baza bağlantı sətri və JWT gizli açar konfiqurasiyası',
    language: 'json',
    code: `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=expensetracker.db",
    "SqlServerConnection": "Server=localhost;Database=ExpenseTrackerDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "SuperSecretKeyForExpenseTracker2026!With32CharsMin",
    "Issuer": "ExpenseTrackerApi",
    "Audience": "ExpenseTrackerClient"
  }
}
`,
  },
  {
    id: 'csproj',
    fileName: 'ExpenseTrackerApi.csproj',
    folder: 'Project',
    description: '.NET 8 Project file with NuGet packages for EF Core, SQLite, and JWT',
    descriptionAz: '.NET 8 Layihə faylı və tələb olunan NuGet paketləri',
    language: 'xml',
    code: `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>ExpenseTrackerApi</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.8">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.7.3" />
  </ItemGroup>

</Project>
`,
  },
  {
    id: 'readme_cs',
    fileName: 'README.md',
    folder: 'Documentation',
    description: 'Step-by-step instructions to compile, run and test C# backend in Visual Studio / VS Code',
    descriptionAz: 'C# .NET 8 backend layihəsini kompüterdə icra etmək üçün təlimat',
    language: 'markdown',
    code: `# Expense Tracker - C# ASP.NET Core Web API Backend

Bu layihə **Task 3: Expense Tracker Web Application** tapşırığı üçün C# .NET 8 və Entity Framework Core ilə hazırlanmış RESTful Web API-dir.

## 🚀 Necə işə salmaq olar? (How to Run)

### 1. Tələblər (Requirements)
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- Visual Studio 2022 və ya Visual Studio Code

### 2. Əmrlər (CLI Commands)
\`\`\`bash
# Layihə qovluğuna keçin
cd ExpenseTrackerApi

# Paketləri bərpa edin
dotnet restore

# Məlumat bazasını qurun və layihəni işə salın
dotnet run
\`\`\`

### 3. Swagger UI ilə API-ləri test edin
Brauzerinizdə açın:
\`http://localhost:5000/swagger\` və ya \`https://localhost:7001/swagger\`

### 🎯 Həyata keçirilmiş Addımlar (Implemented Workflow):
- ✅ **Step 1:** Dashboard məlumatları üçün ümumiləşdirilmiş \`GET /api/expenses/summary\` endpointi
- ✅ **Step 2:** Xərclər və gəlirlər üçün tam CRUD API (\`GET\`, \`POST\`, \`PUT\`, \`DELETE /api/expenses\`)
- ✅ **Step 3:** Entity Framework Core və SQLite / SQL Server ilə bazada saxlama
- ✅ **Step 4:** Kateqoriyalar üzrə hesabatlar və filtrasiya imkanları
- ✅ **Step 5:** JWT Bearer Token və parol heşlənməsi ilə istifadəçi autentifikasiyası (\`POST /api/auth/register\`, \`POST /api/auth/login\`)
`,
  }
];
