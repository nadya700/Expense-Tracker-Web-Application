using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Expense> Expenses { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure indexes
        modelBuilder.Entity<Expense>()
            .HasIndex(e => e.UserId);

        modelBuilder.Entity<Expense>()
            .HasIndex(e => e.Date);

        modelBuilder.Entity<Expense>()
            .HasIndex(e => e.Category);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Seed initial default user
        var defaultUserId = "usr-aydansharifova";
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = defaultUserId,
            Name = "Aydan Şərifova",
            Email = "sharifovaydan700@gmail.com",
            PasswordHash = "AQAAAAEAACcQAAAAEHashedDefaultUserPasswordPlaceholder123==",
            Currency = "₼",
            MonthlyBudget = 1500m,
            BudgetWarningThreshold = 80,
            EnableBudgetAlerts = true,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed sample expenses
        modelBuilder.Entity<Expense>().HasData(
            new Expense
            {
                Id = "exp-1",
                Title = "Əsas Əmək Haqqı",
                Amount = 2400.00m,
                Type = "income",
                Category = "Maaş",
                Date = new DateTime(2026, 3, 1, 10, 0, 0, DateTimeKind.Utc),
                PaymentMethod = "Bank Köçürməsi",
                Notes = "Aylıq əmək haqqı köçürməsi",
                UserId = defaultUserId,
                CreatedAt = new DateTime(2026, 3, 1, 10, 0, 0, DateTimeKind.Utc)
            },
            new Expense
            {
                Id = "exp-2",
                Title = "Mənzil Kirayəsi",
                Amount = 650.00m,
                Type = "expense",
                Category = "Ev & Kommunal",
                Date = new DateTime(2026, 3, 2, 11, 30, 0, DateTimeKind.Utc),
                PaymentMethod = "Kart",
                Notes = "Mart ayı mənzil kirayəsi",
                UserId = defaultUserId,
                CreatedAt = new DateTime(2026, 3, 2, 11, 30, 0, DateTimeKind.Utc)
            },
            new Expense
            {
                Id = "exp-3",
                Title = "Supermarket Bravo Alış-verişi",
                Amount = 185.40m,
                Type = "expense",
                Category = "Qida & Market",
                Date = new DateTime(2026, 3, 4, 18, 15, 0, DateTimeKind.Utc),
                PaymentMethod = "Kart",
                Notes = "Həftəlik ərzaq təchizatı",
                UserId = defaultUserId,
                CreatedAt = new DateTime(2026, 3, 4, 18, 15, 0, DateTimeKind.Utc)
            },
            new Expense
            {
                Id = "exp-4",
                Title = "Freelance UI Dizayn Layihəsi",
                Amount = 450.00m,
                Type = "income",
                Category = "Əlavə Gəlir",
                Date = new DateTime(2026, 3, 5, 14, 0, 0, DateTimeKind.Utc),
                PaymentMethod = "Bank Köçürməsi",
                Notes = "Veb tətbiq dizaynı üçün ödəniş",
                UserId = defaultUserId,
                CreatedAt = new DateTime(2026, 3, 5, 14, 0, 0, DateTimeKind.Utc)
            },
            new Expense
            {
                Id = "exp-5",
                Title = "Nəqliyyat & Yanacaq",
                Amount = 85.00m,
                Type = "expense",
                Category = "Nəqliyyat",
                Date = new DateTime(2026, 3, 6, 9, 20, 0, DateTimeKind.Utc),
                PaymentMethod = "Kart",
                Notes = "Yanacaq doldurma",
                UserId = defaultUserId,
                CreatedAt = new DateTime(2026, 3, 6, 9, 20, 0, DateTimeKind.Utc)
            }
        );
    }
}
