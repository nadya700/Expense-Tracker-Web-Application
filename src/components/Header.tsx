import React, { useState } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  MinusCircle, 
  FileCode, 
  BarChart3, 
  ListOrdered, 
  LayoutDashboard, 
  CheckCircle2, 
  User as UserIcon, 
  LogOut, 
  Globe, 
  Coins
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

export const Header: React.FC = () => {
  const { 
    user, 
    language, 
    setLanguage, 
    activeView, 
    setActiveView, 
    currency, 
    setCurrency, 
    openNewTransactionModal,
    setIsAuthModalOpen
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems: { id: AppView; labelAz: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', labelAz: 'İdarə Paneli', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', labelAz: 'Xərclər və Gəlirlər', labelEn: 'Transactions', icon: ListOrdered },
    { id: 'reports', labelAz: 'Hesabatlar', labelEn: 'Reports', icon: BarChart3 },
    { id: 'csharp_backend', labelAz: 'C# .NET Backend', labelEn: 'C# .NET Backend', icon: FileCode },
    { id: 'task_guide', labelAz: 'Task 3 Bələdçisi', labelEn: 'Task 3 Guide', icon: CheckCircle2 },
  ];

  const currencies = [
    { symbol: '₼', label: 'AZN (₼)' },
    { symbol: '$', label: 'USD ($)' },
    { symbol: '€', label: 'EUR (€)' },
    { symbol: '₺', label: 'TRY (₺)' },
    { symbol: '£', label: 'GBP (£)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">ExpenseTracker</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                    C# .NET 8
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === 'az' ? 'Gəlir, Xərc və Maliyyə İdarəetməsi' : 'Income, Expense & Financial Summaries'}
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{language === 'az' ? item.labelAz : item.labelEn}</span>
                  {item.id === 'csharp_backend' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Add Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-quick-add-income"
                onClick={() => openNewTransactionModal('income')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
                title={language === 'az' ? 'Gəlir Əlavə Et' : 'Add Income'}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'az' ? 'Gəlir' : 'Income'}</span>
              </button>

              <button
                id="btn-quick-add-expense"
                onClick={() => openNewTransactionModal('expense')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all hover:shadow"
              >
                <MinusCircle className="w-4 h-4" />
                <span>{language === 'az' ? 'Xərc Əlavə Et' : 'Add Expense'}</span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="relative group">
              <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors">
                <Coins className="w-3.5 h-3.5 text-slate-500" />
                <span>{currency}</span>
              </div>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 w-32 z-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                  {language === 'az' ? 'Valyuta' : 'Currency'}
                </div>
                {currencies.map(c => (
                  <button
                    key={c.symbol}
                    onClick={() => setCurrency(c.symbol)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between hover:bg-slate-100 ${
                      currency === c.symbol ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>{c.label}</span>
                    {currency === c.symbol && <span className="text-indigo-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switcher */}
            <button
              id="btn-toggle-lang"
              onClick={() => setLanguage(language === 'az' ? 'en' : 'az')}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-medium"
              title={language === 'az' ? 'İngilis dilinə keç' : 'Switch to Azerbaijani'}
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="uppercase">{language}</span>
            </button>

            {/* User Profile / Auth */}
            <div className="relative">
              <button
                id="btn-user-profile"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors"
              >
                <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden lg:inline">
                  {user.name}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {user.name.charAt(0)}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      JWT Bearer Authenticated
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>{language === 'az' ? 'Profil və Büdcə Tənzimləmələri' : 'Profile & Budget Settings'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>{language === 'az' ? 'Hesabdan Çıxış / Dəyişdir' : 'Switch / Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded text-[11px] ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate max-w-[65px]">{language === 'az' ? item.labelAz : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
