using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTrackerApi.Models;

public class User
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

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
    public decimal MonthlyBudget { get; set; } = 1500m;

    public int BudgetWarningThreshold { get; set; } = 80;

    public bool EnableBudgetAlerts { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
