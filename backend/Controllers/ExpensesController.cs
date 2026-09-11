using System.Security.Claims;
using ExpenseTrackerApi.Data;
using ExpenseTrackerApi.DTOs;
using ExpenseTrackerApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(AppDbContext context, ILogger<ExpensesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value 
            ?? "usr-aydansharifova";
    }

    /// <summary>
    /// Bütün əməliyyatları gətir (filtrasiya və axtarış dəstəyi ilə)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseResponseDto>>> GetExpenses(
        [FromQuery] string? type = null,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var userId = GetCurrentUserId();
        var query = _context.Expenses.Where(e => e.UserId == userId);

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(e => e.Type.ToLower() == type.ToLower());
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(e => e.Category == category);
        }

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(e => e.Title.ToLower().Contains(searchLower) || 
                                    (e.Notes != null && e.Notes.ToLower().Contains(searchLower)));
        }

        var results = await query
            .OrderByDescending(e => e.Date)
            .Select(e => new ExpenseResponseDto
            {
                Id = e.Id,
                Title = e.Title,
                Amount = e.Amount,
                Type = e.Type,
                Category = e.Category,
                Date = e.Date,
                PaymentMethod = e.PaymentMethod,
                Notes = e.Notes,
                UserId = e.UserId,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return Ok(results);
    }

    /// <summary>
    /// ID-yə görə tək əməliyyatı gətir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseResponseDto>> GetExpense(string id)
    {
        var userId = GetCurrentUserId();
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense == null)
        {
            return NotFound(new { message = "Əməliyyat tapılmadı" });
        }

        return Ok(new ExpenseResponseDto
        {
            Id = expense.Id,
            Title = expense.Title,
            Amount = expense.Amount,
            Type = expense.Type,
            Category = expense.Category,
            Date = expense.Date,
            PaymentMethod = expense.PaymentMethod,
            Notes = expense.Notes,
            UserId = expense.UserId,
            CreatedAt = expense.CreatedAt
        });
    }

    /// <summary>
    /// Yeni gəlir və ya xərc əlavə et (Aylıq büdcə həddi yoxlanışı ilə)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ExpenseResponseDto>> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var expense = new Expense
        {
            Id = Guid.NewGuid().ToString("N"),
            Title = dto.Title.Trim(),
            Amount = dto.Amount,
            Type = dto.Type.ToLower(),
            Category = dto.Category,
            Date = dto.Date ?? DateTime.UtcNow,
            PaymentMethod = dto.PaymentMethod ?? "Kart",
            Notes = dto.Notes,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Check budget warning if adding an expense
        string? budgetWarning = null;
        if (expense.Type == "expense")
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null && user.EnableBudgetAlerts && user.MonthlyBudget > 0)
            {
                var now = DateTime.UtcNow;
                var currentMonthExpenses = await _context.Expenses
                    .Where(e => e.UserId == userId && e.Type == "expense" && e.Date.Year == now.Year && e.Date.Month == now.Month)
                    .SumAsync(e => e.Amount);

                var ratio = (double)(currentMonthExpenses / user.MonthlyBudget);
                var percent = (int)(ratio * 100);

                if (currentMonthExpenses > user.MonthlyBudget)
                {
                    budgetWarning = $"Diqqət: Cari ay üzrə xərcləriniz ({currentMonthExpenses} {user.Currency}) aylıq büdcənizi ({user.MonthlyBudget} {user.Currency}) aşmışdır ({percent}%)!";
                }
                else if (percent >= user.BudgetWarningThreshold)
                {
                    budgetWarning = $"Xəbərdarlıq: Aylıq xərcləriniz müəyyən edilmiş {user.BudgetWarningThreshold}% həddinə çatmışdır (İstifadə: {percent}%).";
                }
            }
        }

        var response = new ExpenseResponseDto
        {
            Id = expense.Id,
            Title = expense.Title,
            Amount = expense.Amount,
            Type = expense.Type,
            Category = expense.Category,
            Date = expense.Date,
            PaymentMethod = expense.PaymentMethod,
            Notes = expense.Notes,
            UserId = expense.UserId,
            CreatedAt = expense.CreatedAt
        };

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, new 
        { 
            data = response, 
            warning = budgetWarning 
        });
    }

    /// <summary>
    /// Əməliyyatı redaktə et
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(string id, [FromBody] UpdateExpenseDto dto)
    {
        var userId = GetCurrentUserId();
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense == null)
        {
            return NotFound(new { message = "Əməliyyat tapılmadı" });
        }

        expense.Title = dto.Title.Trim();
        expense.Amount = dto.Amount;
        expense.Type = dto.Type.ToLower();
        expense.Category = dto.Category;
        if (dto.Date.HasValue) expense.Date = dto.Date.Value;
        expense.PaymentMethod = dto.PaymentMethod;
        expense.Notes = dto.Notes;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Əməliyyatı sil
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(string id)
    {
        var userId = GetCurrentUserId();
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense == null)
        {
            return NotFound(new { message = "Əməliyyat tapılmadı" });
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Cari maliyyə vəziyyəti xülasəsi və büdcə analizi
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<FinancialSummaryDto>> GetSummary()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        var expenses = await _context.Expenses
            .Where(e => e.UserId == userId)
            .ToListAsync();

        var totalIncome = expenses.Where(e => e.Type == "income").Sum(e => e.Amount);
        var totalExpense = expenses.Where(e => e.Type == "expense").Sum(e => e.Amount);
        var netBalance = totalIncome - totalExpense;

        var now = DateTime.UtcNow;
        var currentMonthExpenses = expenses
            .Where(e => e.Type == "expense" && e.Date.Year == now.Year && e.Date.Month == now.Month)
            .Sum(e => e.Amount);

        var monthlyBudget = user?.MonthlyBudget ?? 1500m;
        var warningThreshold = user?.BudgetWarningThreshold ?? 80;
        var percentageUsed = monthlyBudget > 0 ? (double)(currentMonthExpenses / monthlyBudget * 100) : 0;
        var isExceeded = currentMonthExpenses > monthlyBudget;
        var isApproaching = !isExceeded && percentageUsed >= warningThreshold;

        return Ok(new FinancialSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            NetBalance = netBalance,
            SavingsRate = totalIncome > 0 ? Math.Round((netBalance / totalIncome) * 100, 1) : 0,
            TransactionCount = expenses.Count,
            BudgetStatus = new BudgetStatusDto
            {
                MonthlyBudget = monthlyBudget,
                TotalExpensesThisMonth = currentMonthExpenses,
                RemainingBudget = Math.Max(0, monthlyBudget - currentMonthExpenses),
                PercentageUsed = Math.Round(percentageUsed, 1),
                WarningThreshold = warningThreshold,
                IsApproachingLimit = isApproaching,
                IsExceeded = isExceeded,
                StatusMessage = isExceeded 
                    ? "Büdcə aşılmışdır!" 
                    : isApproaching 
                        ? "Büdcə həddinə yaxınlaşırsınız!" 
                        : "Büdcə nəzarət altındadır."
            }
        });
    }

    /// <summary>
    /// Kateqoriyalar üzrə analitik hesabat
    /// </summary>
    [HttpGet("analytics/categories")]
    public async Task<ActionResult<IEnumerable<CategoryReportDto>>> GetCategoryAnalytics([FromQuery] string type = "expense")
    {
        var userId = GetCurrentUserId();
        var query = _context.Expenses.Where(e => e.UserId == userId && e.Type.ToLower() == type.ToLower());

        var totalAmount = await query.SumAsync(e => e.Amount);

        var reports = await query
            .GroupBy(e => e.Category)
            .Select(g => new
            {
                Category = g.Key,
                Total = g.Sum(x => x.Amount),
                Count = g.Count()
            })
            .OrderByDescending(r => r.Total)
            .ToListAsync();

        var result = reports.Select(r => new CategoryReportDto
        {
            Category = r.Category,
            TotalAmount = r.Total,
            Count = r.Count,
            Percentage = totalAmount > 0 ? Math.Round((double)(r.Total / totalAmount * 100), 1) : 0
        });

        return Ok(result);
    }
}
