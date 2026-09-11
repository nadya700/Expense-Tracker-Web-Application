# Şəxsi Xərc & Maliyyə İdarəetmə Sistemi (Expense Tracker)

Müasir React + Vite + Tailwind CSS frontend və C# ASP.NET Core 8 Web API backend arxitekturasına malik tam funksional maliyyə idarəetmə layihəsi.

---

## 📂 Repozitoriyanın Strukturu

```
├── backend/                      # C# ASP.NET Core 8 Web API Layihəsi
│   ├── Controllers/              # RESTful API Controller-ləri (Auth & Expenses)
│   ├── Data/                     # Entity Framework Core DbContext və Seed data
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Models/                   # Verilənlər bazası modelləri (Expense, User)
│   ├── Program.cs                # Dependency Injection, JWT və Middleware
│   ├── appsettings.json          # Konfiqurasiya faylı
│   └── ExpenseTrackerApi.csproj  # .NET 8 layihə faylı
│
├── src/                          # React + TypeScript Frontend
│   ├── components/               # UI Komponentləri (Dashboard, Transactions, Reports, BudgetModal)
│   ├── context/                  # AppContext (Qlobal vəziyyət, Büdcə xəbərdarlıq mexanizmi)
│   ├── data/                     # Kateqoriyalar və ilkin məlumatlar
│   ├── types.ts                  # TypeScript interfeysləri
│   └── App.tsx                   # Əsas tətbiq görünüşü
│
├── package.json                  # Node.js asılılıqları
└── README.md                     # Layihə sənədləşməsi
```

---

## 💻 Necə İşə Salmalı?

### 1. Frontend (React + Vite):
```bash
npm install
npm run dev
```
Tətbiq brauzerdə `http://localhost:3000` ünvanında açılacaq.

### 2. Backend (C# .NET 8 Web API):
```bash
cd backend
dotnet restore
dotnet run
```
Backend API `http://localhost:5000` (və ya `https://localhost:5001`) üzərindən işləyəcək və Swagger UI `http://localhost:5000/swagger` ünvanında əlçatan olacaq.

---

## 🐙 GitHub-a Necə Yükləmək Olar (Git Push Guide)

Əgər bu layihəni öz GitHub repozitoriyanıza göndərmək istəyirsinizsə:

```bash
# 1. Repozitoriyanı başladın
git init

# 2. Bütün faylları (Frontend və Backend) əlavə edin
git add .

# 3. İlkin commit yaradın
git commit -m "feat: complete personal expense tracker with React frontend and C# .NET 8 backend"

# 4. Əsas budağı təyin edin
git branch -M main

# 5. Öz GitHub repozitoriyanızın linkini əlavə edin (məsələn):
git remote add origin https://github.com/İSTİFADƏÇİ_ADINIZ/expense-tracker.git

# 6. Kodu GitHub-a göndərin
git push -u origin main
```
