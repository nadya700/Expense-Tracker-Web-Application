import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { TransactionModal } from './components/TransactionModal';
import { AuthModal } from './components/AuthModal';
import { BudgetLimitModal } from './components/BudgetLimitModal';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, notification, language } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5">
          <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xs ${
            notification.type === 'warning'
              ? 'bg-amber-600 text-white border-amber-400 shadow-amber-600/30'
              : notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
              : notification.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/40'
              : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
          }`}>
            <div className="p-1 rounded-lg bg-black/15 shrink-0 mt-0.5">
              {notification.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-white" />
              ) : notification.type === 'info' ? (
                <Info className="w-4 h-4 text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              {notification.title && (
                <div className="font-extrabold text-[11px] uppercase tracking-wider text-amber-100 mb-0.5">
                  {notification.title}
                </div>
              )}
              <div className="leading-relaxed text-xs">{notification.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'transactions' && <TransactionsView />}
        {activeView === 'reports' && <ReportsView />}
      </main>

      {/* Modals */}
      <TransactionModal />
      <AuthModal />
      <BudgetLimitModal />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ExpenseTracker</span>
            <span>•</span>
            <span>{language === 'az' ? 'Şəxsi Maliyyə və Xərc İdarəetmə Sistemi' : 'Personal Finance & Expense Management System'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'az' ? 'Təhlükəsiz Məlumat Saxlanması' : 'Secure Data Storage'}</span>
            </span>
            <span>•</span>
            <span>{language === 'az' ? 'Aydan Şərifova üçün hazırlandı' : 'Created for Aydan Sharifova'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
