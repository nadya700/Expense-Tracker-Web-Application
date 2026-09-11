import React, { useMemo, useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  PieChart as PieIcon, 
  Award, 
  Lightbulb,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const { transactions, categories, currency, language, user, summary, showNotification } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30days' | '90days'>('all');

  const userTransactions = useMemo(() => {
    let list = transactions.filter(t => t.userId === user.id);
    if (selectedPeriod === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      list = list.filter(t => new Date(t.date) >= d);
    } else if (selectedPeriod === '90days') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      list = list.filter(t => new Date(t.date) >= d);
    }
    return list;
  }, [transactions, user.id, selectedPeriod]);

  // Expenses by Category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    userTransactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
      total += t.amount;
    });

    return Object.entries(map).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: language === 'az' ? (cat?.nameAz || catId) : (cat?.name || catId),
        amount,
        color: cat?.color || '#94a3b8',
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [userTransactions, categories, language]);

  // Incomes by Category
  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    userTransactions.filter(t => t.type === 'income').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
      total += t.amount;
    });

    return Object.entries(map).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: language === 'az' ? (cat?.nameAz || catId) : (cat?.name || catId),
        amount,
        color: cat?.color || '#10b981',
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [userTransactions, categories, language]);

  // Financial Health Score calculation
  const healthScore = useMemo(() => {
    let score = 70; // baseline
    if (summary.savingsRate > 25) score += 20;
    else if (summary.savingsRate > 15) score += 10;
    else if (summary.savingsRate < 5) score -= 20;

    if (summary.totalExpense <= user.monthlyBudget) score += 10;
    else score -= 15;

    return Math.min(100, Math.max(20, score));
  }, [summary, user.monthlyBudget]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date', 'PaymentMethod', 'Notes'];
    const rows = userTransactions.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.date,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification(language === 'az' ? 'CSV Hesabatı uğurla endirildi' : 'CSV Report downloaded', 'success');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'az' ? 'Maliyyə Hesabatları və İcmal' : 'Financial Reports & Summaries'}
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-200">
              Step 4
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'az' 
              ? 'Xərclərin strukturu, gəlir mənbələri və maliyyə stabilliyi göstəriciləri' 
              : 'Detailed expenditure breakdown, income channels, and fiscal health'}
          </p>
        </div>

        {/* Period Selector & Export Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedPeriod === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              {language === 'az' ? 'Bütün vaxt' : 'All time'}
            </button>
            <button
              onClick={() => setSelectedPeriod('30days')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedPeriod === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              {language === 'az' ? 'Son 30 gün' : 'Last 30 days'}
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{language === 'az' ? 'CSV İxrac' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'az' ? 'Çap Et / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Financial Health & Advice Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur mb-3">
              <Award className="w-4 h-4 text-amber-300" />
              <span>{language === 'az' ? 'Maliyyə Sağlamlığı İndeksi' : 'Financial Health Index'}</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">
              {healthScore >= 80 
                ? (language === 'az' ? 'Əla Maliyyə Balansı! 🌟' : 'Excellent Financial Balance! 🌟') 
                : (language === 'az' ? 'Orta Dərəcəli Maliyyə Balansı' : 'Moderate Financial Health')}
            </h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              {language === 'az'
                ? `Cari gəlirinizin ${summary.savingsRate}% hissəsini yığıma yönəldirsiniz. Büdcə hədəfiniz (${user.monthlyBudget} ${currency}) daxilində xərcləməyə davam edin.`
                : `You are saving ${summary.savingsRate}% of your total earnings. Keep monitoring discretionary spending against your ${user.monthlyBudget} ${currency} budget.`}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-amber-300">{healthScore}</div>
              <div className="text-[11px] text-indigo-200 uppercase font-semibold tracking-wider">/ 100 Bal</div>
            </div>
            <div className="border-l border-white/20 pl-4 space-y-1 text-xs text-indigo-100">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'az' ? 'Yığım dərəcəsi' : 'Savings Rate'}: {summary.savingsRate}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'az' ? 'Xərc nisbəti' : 'Expense ratio'}: {100 - summary.savingsRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Breakdown: Expense vs Income Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Expenses by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'az' ? 'Xərclərin Kateqoriyalar Üzrə Bölgüsü' : 'Expenses by Category'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'az' ? 'Haraya ən çox vəsait xərclənib' : 'Where your money goes'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-600">
              -{summary.totalExpense.toLocaleString()} {currency}
            </span>
          </div>

          <div className="space-y-3">
            {expenseByCategory.map(item => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.amount.toLocaleString()} {currency}</span>
                    <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incomes by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'az' ? 'Gəlir Mənbələrinin Bölgüsü' : 'Income by Source'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'az' ? 'Gəlirlərin struktur bölgüsü' : 'Sources of incoming funds'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              +{summary.totalIncome.toLocaleString()} {currency}
            </span>
          </div>

          <div className="space-y-3">
            {incomeByCategory.map(item => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.amount.toLocaleString()} {currency}</span>
                    <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* C# LINQ Query Explanation for Reports */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            C# LINQ Aggregation & Report Generation (Step 4)
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          {language === 'az' 
            ? 'Bu hesabatlar C# ASP.NET Core-da Entity Framework Core və LINQ GroupBy operatorları ilə bazadan dinamik toplanır:' 
            : 'These analytical reports are aggregated dynamically via C# LINQ GroupBy statements in ASP.NET Core:'}
        </p>
        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`// C# ASP.NET Core LINQ Query for Category Grouping:
var report = await _context.Expenses
    .Where(e => e.UserId == userId && e.Type == "expense")
    .GroupBy(e => e.Category)
    .Select(g => new CategoryReportDto {
        Category = g.Key,
        TotalAmount = g.Sum(x => x.Amount),
        Count = g.Count()
    })
    .OrderByDescending(r => r.TotalAmount)
    .ToListAsync();`}
        </pre>
      </div>

    </div>
  );
};
