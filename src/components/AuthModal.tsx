import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Coins, ShieldCheck, Check, AlertTriangle, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USER } from '../data/initialData';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    user, 
    setUser, 
    language, 
    showNotification,
    updateBudget
  } = useApp();

  const [mode, setMode] = useState<'profile' | 'login' | 'register'>('profile');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState(user.currency || '₼');
  const [monthlyBudget, setMonthlyBudget] = useState(user.monthlyBudget.toString());
  const [warningThreshold, setWarningThreshold] = useState<number>(user.budgetWarningThreshold ?? 80);
  const [enableAlerts, setEnableAlerts] = useState<boolean>(user.enableBudgetAlerts ?? true);

  if (!isAuthModalOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = parseFloat(monthlyBudget) || 1500;
    const updatedUser = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      currency,
      monthlyBudget: budgetVal,
      budgetWarningThreshold: warningThreshold,
      enableBudgetAlerts: enableAlerts,
    };
    setUser(updatedUser);
    updateBudget(budgetVal, warningThreshold, enableAlerts);
    setIsAuthModalOpen(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showNotification(language === 'az' ? 'E-poçt və şifrə daxil edin' : 'Enter email and password', 'error');
      return;
    }
    const loggedUser = {
      ...user,
      email: email.trim(),
    };
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    showNotification(
      language === 'az' ? `Xoş gəldiniz, ${loggedUser.name}!` : `Welcome back, ${loggedUser.name}!`,
      'success'
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showNotification(language === 'az' ? 'Bütün sahələri doldurun' : 'Please fill all fields', 'error');
      return;
    }
    const newUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.trim(),
      currency,
      monthlyBudget: parseFloat(monthlyBudget) || 1500,
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    showNotification(
      language === 'az' ? `Qeydiyyat tamamlandı! Xoş gəldiniz, ${newUser.name}` : `Account created for ${newUser.name}!`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {language === 'az' ? 'İstifadəçi və Autentifikasiya' : 'User Authentication & Profile'}
              </h3>
              <p className="text-xs text-slate-400">Step 5: JWT Token & User Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMode('profile')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'az' ? 'Profil / Büdcə' : 'Profile / Budget'}
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'az' ? 'Daxil Ol (Login)' : 'Login'}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'az' ? 'Qeydiyyat (Register)' : 'Register'}
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {mode === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'az' ? 'Ad və Soyad' : 'Full Name'}</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'az' ? 'E-poçt Ünvanı' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'az' ? 'Valyuta' : 'Currency'}</span>
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                  >
                    <option value="₼">AZN (₼)</option>
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="₺">TRY (₺)</option>
                    <option value="£">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === 'az' ? 'Aylıq Hədəf Büdcə' : 'Monthly Budget'}
                  </label>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={e => setMonthlyBudget(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
              </div>

              {/* Warning Threshold & Alert Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'az' ? 'Büdcə Xəbərdarlıq Həddi' : 'Budget Warning Threshold'}</span>
                  </span>
                  <select
                    value={warningThreshold}
                    onChange={e => setWarningThreshold(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700"
                  >
                    <option value={70}>70%</option>
                    <option value={75}>75%</option>
                    <option value={80}>80% (Standart)</option>
                    <option value={85}>85%</option>
                    <option value={90}>90%</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{language === 'az' ? 'Xərc zamanı anlıq xəbərdarlıq' : 'Instant warning on expense'}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={enableAlerts}
                    onChange={e => setEnableAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'az' ? 'Profili Yadda Saxla' : 'Save Profile'}</span>
              </button>
            </form>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'az' ? 'E-poçt' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sharifovaydan700@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'az' ? 'Şifrə' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all"
              >
                {language === 'az' ? 'Daxil Ol' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'az' ? 'Ad və Soyad' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'az' ? 'E-poçt' : 'Email'} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'az' ? 'Şifrə' : 'Password'} *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
              >
                {language === 'az' ? 'Qeydiyyatdan Keç' : 'Create Account'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
