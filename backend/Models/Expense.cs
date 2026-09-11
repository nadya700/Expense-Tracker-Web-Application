using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTrackerApi.Models;

public class Expense
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "expense"; // "expense" | "income"

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string? PaymentMethod { get; set; } = "Kart";

    [MaxLength(500)]
    public string? Notes { get; set; }

    [Required]
    [MaxLength(50)]
    public string UserId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("UserId")]
    public User? User { get; set; }
}
