import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RotateCcw, 
  Database, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Tag, 
  Trash2, 
  Edit3, 
  SlidersHorizontal 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';

export const TransactionsView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    currency, 
    language, 
    user, 
    deleteTransaction, 
    setEditingTransaction, 
    openNewTransactionModal,
    resetToSampleData,
    showNotification
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [showDbInspector, setShowDbInspector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(t => t.userId === user.id);

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(t => t.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Sort
    return result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, user.id, selectedType, selectedCategory, searchTerm, sortBy]);

  // Totals for current filter
  const filterStats = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return { inc, exp, net: inc - exp, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Export JSON (Step 3: Database backup)
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ExpenseTracker_Database_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification(
      language === 'az' ? 'Baza faylı uğurla ixrac edildi' : 'Database exported successfully',
      'success'
    );
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            localStorage.setItem('expense_tracker_txs', JSON.stringify(parsed));
            window.location.reload();
          } else {
            showNotification(language === 'az' ? 'Yanlış JSON formatı' : 'Invalid JSON file', 'error');
          }
        } catch {
          showNotification(language === 'az' ? 'Fayl oxunarkən xəta baş verdi' : 'Error parsing JSON', 'error');
        }
      };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'az' ? 'Əməliyyatlar və İdarəetmə' : 'Transactions & Records'}
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-200">
              Step 2 & 3
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'az' 
              ? 'Gəlir və xərclərin siyahısı, filtrasiyası və məlumat bazası idarəetməsi' 
              : 'Expense management, query filtering, and database record store'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openNewTransactionModal('income')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{language === 'az' ? 'Gəlir Əlavə Et' : 'Add Income'}</span>
          </button>
          
          <button
            onClick={() => openNewTransactionModal('expense')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'az' ? 'Xərc Əlavə Et' : 'Add Expense'}</span>
          </button>

          <button
            onClick={() => setShowDbInspector(!showDbInspector)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              showDbInspector ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>{language === 'az' ? 'DB Sxem' : 'DB Schema'}</span>
          </button>
        </div>
      </div>

      {/* Database Operations Bar (Step 3: Database Persistence) */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Database className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold">{language === 'az' ? 'Məlumat Bazası:' : 'Database Storage:'}</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-700">
            SQLite / LocalStorage ({transactions.length} qeyd)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'az' ? 'İxrac (JSON)' : 'Export JSON'}</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportJson} 
            accept=".json" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium"
            title="Import JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'az' ? 'İdxal (JSON)' : 'Import JSON'}</span>
          </button>

          <button
            onClick={resetToSampleData}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 font-medium"
            title="Reset Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'az' ? 'Sıfırla' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Database Schema Inspector Dropdown */}
      {showDbInspector && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-indigo-200">
                Step 3: Database Schema & Entity Framework Mapping
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Table: Expenses & Users</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-bold mb-2">-- SQL Schema (SQLite / SQL Server)</div>
              <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`CREATE TABLE Expenses (
  Id NVARCHAR(50) PRIMARY KEY,
  Title NVARCHAR(200) NOT NULL,
  Amount DECIMAL(18,2) NOT NULL,
  Type NVARCHAR(20) NOT NULL,
  Category NVARCHAR(50) NOT NULL,
  Date DATETIME NOT NULL,
  PaymentMethod NVARCHAR(50),
  Notes NVARCHAR(500),
  UserId NVARCHAR(50) NOT NULL,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserId) REFERENCES Users(Id)
);`}
              </pre>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold mb-2">// C# EF Core LINQ Query Execution</div>
              <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`// Asynchronously query database
var records = await _context.Expenses
  .Where(e => e.UserId == currentUserId)
  .Where(e => type == null || e.Type == type)
  .OrderByDescending(e => e.Date)
  .ToListAsync();`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'az' ? 'Axtarış (ad, qeyd)...' : 'Search transactions...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'az' ? 'Hamısı' : 'All'}
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              {language === 'az' ? 'Gəlir' : 'Income'}
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-rose-700'
              }`}
            >
              {language === 'az' ? 'Xərc' : 'Expense'}
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="all">{language === 'az' ? 'Bütün Kateqoriyalar' : 'All Categories'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {language === 'az' ? c.nameAz : c.name} ({c.type === 'income' ? '+' : '-'})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="date_desc">{language === 'az' ? 'Tarix: Ən yenilər' : 'Date: Newest first'}</option>
              <option value="date_asc">{language === 'az' ? 'Tarix: Ən köhnələr' : 'Date: Oldest first'}</option>
              <option value="amount_desc">{language === 'az' ? 'Məbləğ: Yüksəkdən aşağa' : 'Amount: High to Low'}</option>
              <option value="amount_asc">{language === 'az' ? 'Məbləğ: Aşağıdan yüksəyə' : 'Amount: Low to High'}</option>
            </select>
          </div>

        </div>

        {/* Filter Stats Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span>{filterStats.count} {language === 'az' ? 'əməliyyat tapıldı' : 'records found'}</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-semibold">
              +{filterStats.inc.toLocaleString()} {currency}
            </span>
            <span className="text-rose-600 font-semibold">
              -{filterStats.exp.toLocaleString()} {currency}
            </span>
            <span className="font-bold text-slate-900 border-l border-slate-200 pl-3">
              {language === 'az' ? 'Fərq:' : 'Net:'} {filterStats.net.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              {language === 'az' ? 'Heç bir əməliyyat tapılmadı' : 'No transactions match filters'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {language === 'az' 
                ? 'Filtrləri dəyişin və ya yeni gəlir/xərc əlavə edin.' 
                : 'Try adjusting your search criteria or add a new transaction.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">{language === 'az' ? 'Əməliyyat' : 'Transaction'}</th>
                  <th className="py-3.5 px-4">{language === 'az' ? 'Kateqoriya' : 'Category'}</th>
                  <th className="py-3.5 px-4">{language === 'az' ? 'Tarix' : 'Date'}</th>
                  <th className="py-3.5 px-4">{language === 'az' ? 'Ödəniş' : 'Payment'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'az' ? 'Məbləğ' : 'Amount'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'az' ? 'Əməliyyatlar' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.map(tx => {
                  const cat = categories.find(c => c.id === tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Title & Notes */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: cat?.color || (isIncome ? '#10b981' : '#f43f5e') }}
                          >
                            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{tx.title}</span>
                            {tx.notes && (
                              <span className="text-[11px] text-slate-400 line-clamp-1">{tx.notes}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4">
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{ 
                            backgroundColor: (cat?.color || '#64748b') + '18',
                            color: cat?.color || '#334155'
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat?.color }} />
                          {language === 'az' ? (cat?.nameAz || tx.category) : (cat?.name || tx.category)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tx.date}</span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] uppercase font-medium">
                          {tx.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className={`font-extrabold text-sm ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isIncome ? '+' : '-'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              openNewTransactionModal(tx.type);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title={language === 'az' ? 'Redaktə et' : 'Edit'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={language === 'az' ? 'Sil' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
