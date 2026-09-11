import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  Plus, 
  Minus, 
  Calendar, 
  ChevronRight,
  Code2
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

export const Dashboard: React.FC = () => {
  const { 
    transactions, 
    categories, 
    summary, 
    currency, 
    language, 
    user, 
    openNewTransactionModal, 
    setActiveView,
    setEditingTransaction,
    deleteTransaction
  } = useApp();

  // User's transactions
  const userTransactions = useMemo(() => {
    return transactions.filter(t => t.userId === user.id);
  }, [transactions, user.id]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...userTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [userTransactions]);

  // Category breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const expenseTxs = userTransactions.filter(t => t.type === 'expense');
    const catMap: Record<string, number> = {};

    expenseTxs.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    return Object.entries(catMap).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: language === 'az' ? (cat?.nameAz || catId) : (cat?.name || catId),
        value: Math.round(amount * 100) / 100,
        color: cat?.color || '#94a3b8',
      };
    }).sort((a, b) => b.value - a.value);
  }, [userTransactions, categories, language]);

  // Monthly Trend Data
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { month: string; income: number; expense: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsAz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];

    userTransactions.forEach(t => {
      const d = new Date(t.date);
      const mIdx = d.getMonth();
      const mName = language === 'az' ? monthsAz[mIdx] : months[mIdx];
      
      if (!monthMap[mName]) {
        monthMap[mName] = { month: mName, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthMap[mName].income += t.amount;
      } else {
        monthMap[mName].expense += t.amount;
      }
    });

    const result = Object.values(monthMap);
    return result.length > 0 ? result : [
      { month: language === 'az' ? 'Sen' : 'Sep', income: summary.totalIncome, expense: summary.totalExpense }
    ];
  }, [userTransactions, language, summary]);

  // Budget progress
  const budgetSpentPercent = Math.min(100, Math.round((summary.totalExpense / (user.monthlyBudget || 1500)) * 100));
  const isBudgetWarning = budgetSpentPercent >= 80;

  return (
    <div className="space-y-6">
      
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'az' ? `Salam, ${user.name} 👋` : `Welcome back, ${user.name} 👋`}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'az' 
              ? 'Maliyyə vəziyyətinizin və cari xərclərinizin canlı icmalı (Task 3: Step 1 Dashboard)' 
              : 'Real-time overview of your financial health & budget (Task 3: Step 1 Dashboard)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openNewTransactionModal('income')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{language === 'az' ? 'Gəlir Əlavə Et' : 'Add Income'}</span>
          </button>
          <button
            onClick={() => openNewTransactionModal('expense')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>{language === 'az' ? 'Xərc Əlavə Et' : 'Add Expense'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {language === 'az' ? 'Cari Balans' : 'Total Balance'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold tracking-tight ${summary.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {summary.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`inline-flex items-center font-medium ${summary.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summary.netBalance >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {summary.netBalance >= 0 ? (language === 'az' ? 'Müsbət qalıq' : 'Net positive') : (language === 'az' ? 'Kəsir' : 'Deficit')}
            </span>
            <span className="text-slate-400">• {summary.incomeCount + summary.expenseCount} {language === 'az' ? 'əməliyyat' : 'transactions'}</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              {language === 'az' ? 'Ümumi Gəlir' : 'Total Income'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold tracking-tight text-emerald-700">
              +{summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{summary.incomeCount} {language === 'az' ? 'daxilolma mənbəyi' : 'income sources'}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
              {language === 'az' ? 'Ümumi Xərclər' : 'Total Expenses'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold tracking-tight text-rose-600">
              -{summary.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{summary.expenseCount} {language === 'az' ? 'xərc qeydi' : 'expense records'}</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {language === 'az' ? 'Yığım Qabiliyyəti' : 'Savings Rate'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold tracking-tight text-indigo-700">
              {summary.savingsRate}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {summary.savingsRate > 20 
              ? (language === 'az' ? 'Əla! Tövsiyə olunan >20%' : 'Healthy! Recommended >20%')
              : (language === 'az' ? 'Xərclərə nəzarət tövsiyə edilir' : 'Consider tightening budget')}
          </div>
        </div>

      </div>

      {/* Monthly Budget Progress Alert */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {language === 'az' ? 'Aylıq Büdcə İcrası' : 'Monthly Budget Progress'}
            </span>
            {isBudgetWarning && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {language === 'az' ? 'Büdcə limitinə yaxınlaşır' : 'Approaching limit'}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {summary.totalExpense.toLocaleString()} {currency} / {user.monthlyBudget.toLocaleString()} {currency} ({budgetSpentPercent}%)
          </div>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              budgetSpentPercent > 90 ? 'bg-rose-500' : budgetSpentPercent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${budgetSpentPercent}%` }}
          />
        </div>
      </div>

      {/* Charts Section: Monthly Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Inflow vs Outflow Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'az' ? 'Gəlir və Xərc Dinamikası' : 'Income vs Expense Trend'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'az' ? 'Aylıq pul axını müqayisəsi' : 'Monthly cash flow comparison'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span className="text-slate-600">{language === 'az' ? 'Gəlir' : 'Income'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span className="text-slate-600">{language === 'az' ? 'Xərc' : 'Expense'}</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {language === 'az' ? 'Xərclərin Bölgüsü' : 'Expense Categories'}
            </h2>
            <p className="text-xs text-slate-500 mb-2">
              {language === 'az' ? 'Ən çox xərclənən sahələr' : 'Top spending distribution'}
            </p>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              {language === 'az' ? 'Hələ ki xərc qeydi yoxdur' : 'No expense records yet'}
            </div>
          ) : (
            <div className="relative h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString()} ${currency}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">{language === 'az' ? 'Xərclər' : 'Total'}</span>
                <span className="text-sm font-bold text-slate-800">{summary.totalExpense.toLocaleString()} {currency}</span>
              </div>
            </div>
          )}

          {/* Top 3 categories list */}
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {categoryData.slice(0, 3).map(item => {
              const pct = summary.totalExpense > 0 ? Math.round((item.value / summary.totalExpense) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>{item.value.toLocaleString()} {currency}</span>
                    <span className="font-semibold text-slate-800 text-[11px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Transactions & C# API Live Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Table / List (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'az' ? 'Son Əməliyyatlar' : 'Recent Transactions'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'az' ? 'Ən son qeydə alınmış gəlir və xərclər' : 'Latest financial activity'}
              </p>
            </div>
            <button
              onClick={() => setActiveView('transactions')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>{language === 'az' ? 'Hamısına bax' : 'View all'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map(tx => {
              const cat = categories.find(c => c.id === tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: cat?.color || (isIncome ? '#10b981' : '#f43f5e') }}
                    >
                      {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{tx.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{language === 'az' ? (cat?.nameAz || tx.category) : (cat?.name || tx.category)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {tx.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isIncome ? '+' : '-'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">{tx.paymentMethod.replace('_', ' ')}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTransaction(tx);
                          openNewTransactionModal(tx.type);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs"
                        title={language === 'az' ? 'Redaktə et' : 'Edit'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        title={language === 'az' ? 'Sil' : 'Delete'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* C# ASP.NET Core API Integration Box (1 col) */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Code2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  C# ASP.NET Core API
                </span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                RESTful Controller
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1.5">
              {language === 'az' ? 'Dashboard C# ilə necə işləyir?' : 'How Dashboard connects to C#'}
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {language === 'az' 
                ? 'Bu ekran məlumatları ASP.NET Core ExpensesController-in GetSummary() və GetExpenses() metodlarından əldə edir.' 
                : 'This dashboard queries ASP.NET Core ExpensesController via LINQ and Entity Framework Core.'}
            </p>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-indigo-900/40 text-[11px] font-mono text-indigo-200 overflow-x-auto space-y-1">
              <div className="text-emerald-400">// C# Controller Action:</div>
              <div className="text-purple-300">[HttpGet("summary")]</div>
              <div className="text-blue-300">public async Task&lt;ActionResult&gt; GetSummary()</div>
              <div className="text-slate-400">{"{"}</div>
              <div className="pl-3 text-slate-300">var total = await _context.Expenses</div>
              <div className="pl-6 text-slate-300">.Where(e =&gt; e.UserId == uid)</div>
              <div className="pl-6 text-yellow-300">.SumAsync(e =&gt; e.Amount);</div>
              <div className="pl-3 text-slate-300">return Ok(new SummaryDto(...));</div>
              <div className="text-slate-400">{"}"}</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-900/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {language === 'az' ? 'Bütün C# kodlarını araşdırın' : 'Explore full C# solution'}
            </span>
            <button
              onClick={() => setActiveView('csharp_backend')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
            >
              {language === 'az' ? 'Kodu Aç' : 'Open Code'} →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
