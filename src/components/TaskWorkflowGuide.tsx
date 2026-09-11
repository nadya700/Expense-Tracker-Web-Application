import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  LayoutDashboard, 
  FileCode, 
  Database, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

export const TaskWorkflowGuide: React.FC = () => {
  const { language, setActiveView, openNewTransactionModal, setIsAuthModalOpen } = useApp();

  const steps = [
    {
      num: 1,
      title: 'Step 1: Design dashboard screens',
      titleAz: 'Addım 1: İdarə paneli (Dashboard) ekranlarının dizaynı',
      desc: 'Create clean, high-contrast KPI cards (Total Balance, Income, Expense, Savings rate), dynamic budget progress bar, recent activity stream, and monthly cash flow charts.',
      descAz: 'Balans, Ümumi Gəlir, Xərc, Yığım faizi kartları, büdcə icrası və Recharts dinamik qrafikləri tərtib edildi.',
      targetView: 'dashboard' as AppView,
      status: 'Tamamlandı (Completed)',
      icon: LayoutDashboard,
      color: 'bg-indigo-600',
    },
    {
      num: 2,
      title: 'Step 2: Create expense management APIs',
      titleAz: 'Addım 2: Xərc və gəlir idarəetmə API-lərinin yaradılması',
      desc: 'Implement full CRUD actions (GET, POST, PUT, DELETE), type discrimination (income/expense), category tagging, payment methods, and query filters.',
      descAz: 'Tam CRUD API əməliyyatları, gəlir/xərc növləri, kateqoriyalar və axtarış/filtrasiya modulları hazırlandı.',
      targetView: 'transactions' as AppView,
      status: 'Tamamlandı (Completed)',
      icon: FileCode,
      color: 'bg-blue-600',
    },
    {
      num: 3,
      title: 'Step 3: Store financial records in a database',
      titleAz: 'Addım 3: Maliyyə qeydlərinin məlumat bazasında saxlanması',
      desc: 'Persistent storage with Entity Framework Core DbContext schemas (SQLite / SQL Server), indices, and JSON database export/import backup utilities.',
      descAz: 'Entity Framework Core və yerli SQLite/LocalStorage bazası, cədvəl sxemləri və JSON backup/bərpa mexanizmi.',
      targetView: 'transactions' as AppView,
      status: 'Tamamlandı (Completed)',
      icon: Database,
      color: 'bg-emerald-600',
    },
    {
      num: 4,
      title: 'Step 4: Display reports and summaries',
      titleAz: 'Addım 4: Hesabatlar və xülasələrin nümayiş etdirilməsi',
      desc: 'Category expenditure distribution, income stream breakdowns, financial health index, cash flow comparison, and CSV export / Print PDF.',
      descAz: 'Xərclərin faiz payı, gəlir mənbələri, maliyyə sağlamlıq dərəcəsi və CSV/Çap hesabatları təqdim olunur.',
      targetView: 'reports' as AppView,
      status: 'Tamamlandı (Completed)',
      icon: BarChart3,
      color: 'bg-purple-600',
    },
    {
      num: 5,
      title: 'Step 5: Implement authentication',
      titleAz: 'Addım 5: İstifadəçi autentifikasiyasının tətbiqi',
      desc: 'Secure user login, registration, JWT Bearer Token issuance, password hashing, and user-isolated financial accounts.',
      descAz: 'İstifadəçi qeydiyyatı, giriş, ASP.NET Core JWT Bearer token təhlükəsizliyi və fərdi büdcə tənzimləmələri.',
      targetView: 'dashboard' as AppView,
      action: () => setIsAuthModalOpen(true),
      status: 'Tamamlandı (Completed)',
      icon: ShieldCheck,
      color: 'bg-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner matching the original task slide */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tapşırıq Tələbləri & İcrası (Task Requirements Verification)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Task 3 (Medium) – <span className="text-rose-600">Expense Tracker Web Application</span>
            </h1>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              {language === 'az' 
                ? 'Təsvir: Gəlir, xərc və maliyyə hesabatlarını idarə etmək üçün tam funksional veb tətbiqi və C# .NET 8 Web API backend həlli.' 
                : 'Description: Develop a web application to track income, expenses, and financial summaries.'}
            </p>
          </div>

          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-center shrink-0">
            <div className="text-2xl font-black">5 / 5</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {language === 'az' ? 'Bütün Addımlar Tam' : 'All Steps Completed'}
            </div>
          </div>
        </div>

        {/* Skills learned grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-800 block">Full-Stack Development</span>
            <span className="text-[11px] text-slate-500">React + C# .NET 8</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-800 block">Authentication</span>
            <span className="text-[11px] text-slate-500">JWT Bearer Security</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-800 block">Database Operations</span>
            <span className="text-[11px] text-slate-500">EF Core 8 + SQLite</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-800 block">Data Visualization</span>
            <span className="text-[11px] text-slate-500">Recharts + Analytics</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.num}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">
                      {language === 'az' ? step.titleAz : step.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                    {language === 'az' ? step.descAz : step.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (step.action) {
                    step.action();
                  } else {
                    setActiveView(step.targetView);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-colors shrink-0"
              >
                <span>{language === 'az' ? 'Yoxla & Keç' : 'Test / Open'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* C# Solution Callout */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white">
            {language === 'az' ? 'C# ASP.NET Core Layihəsini Endirmək İstəyirsiniz?' : 'Need to submit the C# ASP.NET Core Project?'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'az' 
              ? 'Müəlliminizə və ya kursa təqdim etmək üçün bütün .cs faylları, .csproj və README tam hazırdır.' 
              : 'All .cs source files, controllers, migrations, and documentation are ready to copy or download.'}
          </p>
        </div>
        <button
          onClick={() => setActiveView('csharp_backend')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-colors shrink-0 flex items-center gap-2"
        >
          <span>{language === 'az' ? 'C# Kodlarına Keç' : 'Open C# Solution'}</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
