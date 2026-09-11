import React, { useState } from 'react';
import { 
  X, 
  Target, 
  AlertTriangle, 
  Check, 
  Sliders, 
  Bell, 
  BellRing, 
  TrendingDown, 
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BudgetLimitModal: React.FC = () => {
  const { 
    isBudgetModalOpen, 
    setIsBudgetModalOpen, 
    user, 
    updateBudget, 
    summary, 
    currency, 
    language 
  } = useApp();

  const [budgetInput, setBudgetInput] = useState<string>(user.monthlyBudget.toString());
  const [threshold, setThreshold] = useState<number>(user.budgetWarningThreshold ?? 80);
  const [enableAlerts, setEnableAlerts] = useState<boolean>(user.enableBudgetAlerts ?? true);

  if (!isBudgetModalOpen) return null;

  const currentBudget = parseFloat(budgetInput) || user.monthlyBudget || 1500;
  const currentExpense = summary.budgetStatus.currentMonthExpense;
  const previewPercent = Math.round((currentExpense / currentBudget) * 1000) / 10;
  const isOver = currentExpense >= currentBudget;
  const isApproaching = !isOver && previewPercent >= threshold;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) return;

    updateBudget(val, threshold, enableAlerts);
    setIsBudgetModalOpen(false);
  };

  const quickPresets = [800, 1200, 1500, 2000, 2500, 3000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isOver 
                ? 'bg-rose-100 text-rose-600' 
                : isApproaching 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-indigo-50 text-indigo-600'
            }`}>
              {isOver ? <ShieldAlert className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'az' ? 'Aylıq Büdcə Limiti və Xəbərdarlıqlar' : 'Monthly Budget Limit & Alerts'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'az' ? 'Maksimum xərc həddini və xəbərdarlıq faizini təyin edin' : 'Configure spending ceiling & warning trigger'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBudgetModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
          
          {/* Live Status Preview Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isOver 
              ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
              : isApproaching 
              ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
              : 'bg-indigo-50/60 border-indigo-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                {isOver ? (
                  <span className="flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {language === 'az' ? 'LİMİT AŞILDI!' : 'LIMIT EXCEEDED!'}
                  </span>
                ) : isApproaching ? (
                  <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {language === 'az' ? 'LİMİTƏ YAXINLAŞIR' : 'APPROACHING LIMIT'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    {language === 'az' ? 'BÜDCƏ DAXİLİNDƏ (TƏHLÜKƏSİZ)' : 'WITHIN BUDGET'}
                  </span>
                )}
              </div>
              <div className="text-xs font-mono font-bold">
                {previewPercent}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/80 h-3 rounded-full overflow-hidden p-0.5 border border-black/5 relative">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isOver ? 'bg-rose-600' : isApproaching ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, previewPercent)}%` }}
              />
              {/* Threshold indicator line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80 z-10"
                style={{ left: `${threshold}%` }}
                title={`Xəbərdarlıq həddi: ${threshold}%`}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">{language === 'az' ? 'Cari Xərclər' : 'Current Expenses'}:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {currentExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">
                  {isOver 
                    ? (language === 'az' ? 'Aşma Məbləği' : 'Exceeded By')
                    : (language === 'az' ? 'Qalan Büdcə' : 'Remaining')}:
                </span>
                <span className={`font-bold font-mono ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isOver 
                    ? `+${(currentExpense - currentBudget).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
                    : `${Math.max(0, currentBudget - currentExpense).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Budget Input Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{language === 'az' ? 'Aylıq Büdcə Həddi (Məbləğ)' : 'Monthly Budget Ceiling'}</span>
              <span className="text-[11px] text-indigo-600 font-normal">{currency} valyutasında</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="50"
                min="100"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-bold font-mono text-slate-900 focus:ring-2 focus:ring-indigo-200 outline-none pr-12"
                placeholder="1500"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                {currency}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 py-1 mr-1">
                {language === 'az' ? 'Hazır seçimlər:' : 'Presets:'}
              </span>
              {quickPresets.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setBudgetInput(preset.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    budgetInput === preset.toString()
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset} {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Warning Threshold Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'az' ? 'Xəbərdarlıq Başlanğıc Həddi' : 'Warning Trigger Threshold'}</span>
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {threshold}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              {language === 'az' 
                ? `Xərcləriniz büdcənin ${threshold}%-nə çatdıqda avtomatik xəbərdarlıq bildirişi göndərilir.` 
                : `A notification is triggered when expenses reach ${threshold}% of your monthly budget.`}
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[70, 75, 80, 90].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setThreshold(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    threshold === val
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {val}%
                  <span className="block text-[10px] font-normal text-slate-400">
                    {val === 80 ? (language === 'az' ? 'Standart' : 'Standard') : `${Math.round(currentBudget * (val / 100))} ${currency}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                enableAlerts ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
              }`}>
                {enableAlerts ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {language === 'az' ? 'Anlıq Xəbərdarlıq Bildirişləri' : 'Instant Budget Limit Alerts'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'az' ? 'Yeni xərc əlavə ediləndə və ya dəyişəndə' : 'When adding or updating expenses'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableAlerts}
                onChange={e => setEnableAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {language === 'az' ? 'İmtina' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'az' ? 'Yadda Saxla və Tətbiq Et' : 'Save & Apply'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
