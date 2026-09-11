import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { CSharpSolutionView } from './components/CSharpSolutionView';
import { TaskWorkflowGuide } from './components/TaskWorkflowGuide';
import { TransactionModal } from './components/TransactionModal';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2, AlertTriangle, Info, X, Heart, ShieldCheck, Code } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, notification, language, setActiveView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
              : notification.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/30'
              : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
          }`}>
            {notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'transactions' && <TransactionsView />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'csharp_backend' && <CSharpSolutionView />}
        {activeView === 'task_guide' && <TaskWorkflowGuide />}
      </main>

      {/* Modals */}
      <TransactionModal />
      <AuthModal />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ExpenseTracker</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              <Code className="w-3 h-3" /> C# ASP.NET Core 8.0 & EF Core
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button 
              onClick={() => setActiveView('task_guide')} 
              className="hover:text-indigo-600 transition-colors"
            >
              Task 3 Checklist
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveView('csharp_backend')} 
              className="hover:text-indigo-600 transition-colors"
            >
              C# Solution Explorer
            </button>
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
