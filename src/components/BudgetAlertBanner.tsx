import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  X, 
  Target, 
  TrendingDown, 
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BudgetAlertBanner: React.FC = () => {
  const { summary, user, currency, language, setIsBudgetModalOpen, setActiveView } = useApp();
  const [dismissed, setDismissed] = useState(false);

  const { budgetStatus } = summary;
  const { isExceeded, isApproaching, percentUsed, remainingBudget, overBudgetAmount, monthlyBudget, currentMonthExpense } = budgetStatus;

  // If user disabled alerts or neither approaching nor exceeded, or dismissed
  if (!user.enableBudgetAlerts && user.enableBudgetAlerts !== undefined) return null;
  if (!isExceeded && !isApproaching) return null;
  if (dismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 animate-in fade-in">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {isExceeded 
              ? (language === 'az' ? `Büdcə limiti aşıldı (${percentUsed}%)` : `Budget exceeded (${percentUsed}%)`)
              : (language === 'az' ? `Büdcə limitinə yaxınlaşır (${percentUsed}%)` : `Approaching budget limit (${percentUsed}%)`)
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="text-indigo-700 font-bold hover:underline text-[11px]"
          >
            {language === 'az' ? 'Tənzimlə' : 'Configure'}
          </button>
          <button
            onClick={() => setDismissed(false)}
            className="text-slate-400 hover:text-slate-600 text-[11px]"
          >
            {language === 'az' ? 'Genişləndir' : 'Expand'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all shadow-xs relative overflow-hidden ${
      isExceeded 
        ? 'bg-gradient-to-r from-rose-50 via-rose-50/70 to-red-50/50 border-rose-200/90 text-rose-950 shadow-rose-500/5' 
        : 'bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50/50 border-amber-200/90 text-amber-950 shadow-amber-500/5'
    }`}>
      <div className="flex items-start justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isExceeded ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            {isExceeded ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                {isExceeded 
                  ? (language === 'az' ? '🚨 Aylıq Büdcə Limiti Aşıldı!' : '🚨 Monthly Budget Limit Exceeded!')
                  : (language === 'az' ? '⚠️ Xəbərdarlıq: Aylıq Büdcə Limitinə Yaxınlaşırsınız' : '⚠️ Warning: Approaching Monthly Budget Limit')
                }
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                isExceeded 
                  ? 'bg-rose-100 text-rose-800 border-rose-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {percentUsed}% {language === 'az' ? 'sərf olunub' : 'used'}
              </span>
            </div>

            <p className="text-xs sm:text-sm mt-1 leading-relaxed max-w-3xl opacity-90">
              {isExceeded ? (
                language === 'az' ? (
                  <>
                    Bu ay üzrə xərcləriniz təyin etdiyiniz <strong className="font-bold">{monthlyBudget.toLocaleString()} {currency}</strong> büdcə limitini keçmişdir. 
                    Cari xərclər: <strong className="font-bold font-mono">{currentMonthExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</strong>. 
                    Aşma məbləği: <strong className="font-bold text-rose-700 font-mono">+{overBudgetAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</strong>.
                  </>
                ) : (
                  <>
                    Your monthly expenses have exceeded your set budget limit of <strong className="font-bold">{monthlyBudget.toLocaleString()} {currency}</strong>. 
                    Current expenses: <strong className="font-bold font-mono">{currentMonthExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</strong>. 
                    Exceeded by <strong className="font-bold text-rose-700 font-mono">+{overBudgetAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</strong>.
                  </>
                )
              ) : (
                language === 'az' ? (
                  <>
                    Bu ay üzrə xərcləriniz təyin etdiyiniz <strong className="font-bold">{monthlyBudget.toLocaleString()} {currency}</strong> büdcə limitinin <strong className="font-bold">{percentUsed}%</strong>-nə çatmışdır. 
                    Limitə çatmağa yalnız <strong className="font-bold text-amber-800 font-mono">{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</strong> qalıb.
                  </>
                ) : (
                  <>
                    Your expenses have reached <strong className="font-bold">{percentUsed}%</strong> of your <strong className="font-bold">{monthlyBudget.toLocaleString()} {currency}</strong> monthly budget limit. 
                    Only <strong className="font-bold text-amber-800 font-mono">{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</strong> left before reaching your ceiling.
                  </>
                )
              )}
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                  isExceeded ? 'bg-rose-700 hover:bg-rose-800' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{language === 'az' ? 'Büdcə Limitini Dəyiş' : 'Adjust Budget Limit'}</span>
              </button>

              <button
                onClick={() => setActiveView('transactions')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-slate-800 border border-slate-200 transition-colors"
              >
                <span>{language === 'az' ? 'Xərcləri Nəzərdən Keçir' : 'Review Expenses'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-black/5 rounded-lg transition-colors shrink-0"
          title={language === 'az' ? 'Bağla' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
