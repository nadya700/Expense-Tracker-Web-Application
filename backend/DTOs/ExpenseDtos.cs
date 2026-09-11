using System.ComponentModel.DataAnnotations;

namespace ExpenseTrackerApi.DTOs;

public class CreateExpenseDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Range(0.01, 10000000)]
    public decimal Amount { get; set; }

    [Required]
    public string Type { get; set; } = "expense"; // "expense" | "income"

    [Required]
    public string Category { get; set; } = string.Empty;

    public DateTime? Date { get; set; }

    public string? PaymentMethod { get; set; }

    public string? Notes { get; set; }
}

public class UpdateExpenseDto : CreateExpenseDto
{
}

public class ExpenseResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class BudgetStatusDto
{
    public decimal MonthlyBudget { get; set; }
    public decimal TotalExpensesThisMonth { get; set; }
    public decimal RemainingBudget { get; set; }
    public double PercentageUsed { get; set; }
    public int WarningThreshold { get; set; }
    public bool IsApproachingLimit { get; set; }
    public bool IsExceeded { get; set; }
    public string StatusMessage { get; set; } = string.Empty;
}

public class FinancialSummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetBalance { get; set; }
    public decimal SavingsRate { get; set; }
    public int TransactionCount { get; set; }
    public BudgetStatusDto BudgetStatus { get; set; } = new();
}

public class CategoryReportDto
{
    public string Category { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string? Currency { get; set; } = "₼";
    public decimal? MonthlyBudget { get; set; } = 1500m;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Currency { get; set; } = "₼";
    public decimal MonthlyBudget { get; set; }
    public int BudgetWarningThreshold { get; set; }
    public bool EnableBudgetAlerts { get; set; }
}

public class UpdateBudgetDto
{
    [Range(0, 10000000)]
    public decimal MonthlyBudget { get; set; }

    [Range(50, 100)]
    public int BudgetWarningThreshold { get; set; } = 80;

    public bool EnableBudgetAlerts { get; set; } = true;
}
