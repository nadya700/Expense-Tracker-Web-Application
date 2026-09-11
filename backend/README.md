# Expense Tracker - C# ASP.NET Core 8 Web API Backend

Bu qovluq Şəxsi Maliyyə & Xərc İdarəetmə tətbiqinin C# ASP.NET Core 8 bazasında qurulmuş tam RESTful Web API layihəsidir.

## 📁 Layihə Strukturu

```
backend/
├── Controllers/
│   ├── AuthController.cs         # İstifadəçi qeydiyyatı, giriş (JWT Bearer) və büdcə tənzimləmələri
│   └── ExpensesController.cs     # Xərc/Gəlir CRUD, dinamik axtarış, filtrasiya, büdcə xəbərdarlıqları və analitika
├── Data/
│   └── AppDbContext.cs           # Entity Framework Core DbContext, SQLite mapping və ilkin seed məlumatları
├── DTOs/
│   └── ExpenseDtos.cs            # Data Transfer Objects (sorğu və cavab modelləri)
├── Models/
│   ├── Expense.cs                # Xərc və Gəlir məlumat bazası modeli
│   └── User.cs                   # İstifadəçi və büdcə modeli
├── appsettings.json              # Konfiqurasiya (JWT secret, Connection String)
├── ExpenseTrackerApi.csproj      # .NET 8 SDK və NuGet asılılıqları
└── Program.cs                    # Dependency Injection, Middleware, Swagger və CORS konfiqurasiyası
```

## 🚀 Texnologiyalar

- **Framework:** .NET 8 (C# 12)
- **API Arxitekturası:** ASP.NET Core Web API (RESTful)
- **ORM:** Entity Framework Core 8
- **Məlumat Bazası:** SQLite (`expensetracker.db`) / SQL Server dəstəyi
- **Təhlükəsizlik:** JWT Bearer Authentication (JSON Web Tokens)
- **Sənədləşmə:** Swagger / OpenAPI (UI ilə)
- **CORS:** React / Vite frontend üçün tam açıq konfiqurasiya

## ⚙️ Necə İcra Etməli (Run Instructions)

### 1. Tələblər:
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

### 2. Layihəni işə salmaq:
```bash
cd backend
dotnet restore
dotnet run
```

### 3. Swagger Sənədləşməsi:
Server işə düşdükdən sonra brauzerdə açın:
- `http://localhost:5000/swagger` və ya `https://localhost:5001/swagger`

## 🔑 Əsas API Endpoint-ləri:

| Metod | Endpoint | Təsvir | Autentifikasiya |
|---|---|---|---|
| `POST` | `/api/auth/register` | Yeni istifadəçi qeydiyyatı | Açıq |
| `POST` | `/api/auth/login` | Giriş və JWT Token əldə etmə | Açıq |
| `PUT` | `/api/auth/budget` | Aylıq büdcə həddi və xəbərdarlıq faizini yeniləmə | Bearer JWT |
| `GET` | `/api/expenses` | Əməliyyatların siyahısı (filtr və axtarış ilə) | Bearer JWT |
| `POST` | `/api/expenses` | Yeni gəlir/xərc əlavə et (Büdcə xəbərdarlığı ilə) | Bearer JWT |
| `GET` | `/api/expenses/{id}` | Tək əməliyyatın detalları | Bearer JWT |
| `PUT` | `/api/expenses/{id}` | Əməliyyatı redaktə et | Bearer JWT |
| `DELETE` | `/api/expenses/{id}` | Əməliyyatı sil | Bearer JWT |
| `GET` | `/api/expenses/summary` | Maliyyə balansı və büdcə vəziyyəti xülasəsi | Bearer JWT |
| `GET` | `/api/expenses/analytics/categories` | Kateqoriyalar üzrə xərc paylanması | Bearer JWT |
