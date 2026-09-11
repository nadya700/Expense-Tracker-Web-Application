import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownCircle, ArrowUpCircle, Tag, CreditCard, Calendar, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, TransactionType } from '../types';

export const TransactionModal: React.FC = () => {
  const { 
    isTransactionModalOpen, 
    setIsTransactionModalOpen, 
    editingTransaction, 
    addTransaction, 
    updateTransaction, 
    categories, 
    currency, 
    language,
    defaultModalType
  } = useApp();

  const [type, setType] = useState<TransactionType>(defaultModalType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit_card');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
    } else {
      setType(defaultModalType);
      setTitle('');
      setAmount('');
      const defaultCat = categories.find(c => c.type === defaultModalType)?.id || 'food';
      setCategory(defaultCat);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('debit_card');
      setNotes('');
    }
    setErrors({});
  }, [editingTransaction, isTransactionModalOpen, defaultModalType, categories]);

  // Update category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstMatchingCat = categories.find(c => c.type === newType);
    if (firstMatchingCat) {
      setCategory(firstMatchingCat.id);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = language === 'az' ? 'Başlıq daxil edilməlidir' : 'Title is required';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = language === 'az' ? 'Düzgün məbləğ daxil edin (> 0)' : 'Enter a valid amount (> 0)';
    }
    if (!category) {
      newErrors.category = language === 'az' ? 'Kateqoriya seçin' : 'Select a category';
    }
    if (!date) {
      newErrors.date = language === 'az' ? 'Tarix seçin' : 'Select a date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, {
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      await addTransaction({
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    }

    setIsTransactionModalOpen(false);
  };

  if (!isTransactionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {editingTransaction
                  ? (language === 'az' ? 'Əməliyyatı Redaktə Et' : 'Edit Transaction')
                  : (type === 'income' 
                      ? (language === 'az' ? 'Yeni Gəlir Daxil Et' : 'Add New Income') 
                      : (language === 'az' ? 'Yeni Xərc Daxil Et' : 'Add New Expense'))}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'az' ? 'C# ASP.NET Core API ilə sinxronlaşır' : 'Syncs with C# ASP.NET Core API'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTransactionModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Type Toggle: Expense / Income */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>{language === 'az' ? 'Xərc (Expense)' : 'Expense'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>{language === 'az' ? 'Gəlir (Income)' : 'Income'}</span>
              </button>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {language === 'az' ? 'Məbləğ' : 'Amount'} ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                {currency}
              </span>
              <input
                id="tx-amount-input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xl font-extrabold focus:outline-none focus:ring-2 transition-all ${
                  errors.amount ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-200'
                }`}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {language === 'az' ? 'Təyinat / Başlıq' : 'Description / Title'} *
            </label>
            <input
              id="tx-title-input"
              type="text"
              placeholder={type === 'income' ? (language === 'az' ? 'Məsələn: Maaş, Mükafat' : 'e.g., Salary, Bonus') : (language === 'az' ? 'Məsələn: Supermarket, Kafe' : 'e.g., Groceries, Dinner')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.title ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-200'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'az' ? 'Kateqoriya' : 'Category'} *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredCategories.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all text-xs font-medium ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{language === 'az' ? cat.nameAz : cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'az' ? 'Tarix' : 'Date'} *</span>
              </label>
              <input
                id="tx-date-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'az' ? 'Ödəniş Üsulu' : 'Payment Method'}</span>
              </label>
              <select
                id="tx-payment-input"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                <option value="debit_card">{language === 'az' ? 'Debet Kartı' : 'Debit Card'}</option>
                <option value="credit_card">{language === 'az' ? 'Kredit Kartı' : 'Credit Card'}</option>
                <option value="cash">{language === 'az' ? 'Nağd Pul' : 'Cash'}</option>
                <option value="bank_transfer">{language === 'az' ? 'Bank Köçürməsi' : 'Bank Transfer'}</option>
                <option value="other">{language === 'az' ? 'Digər' : 'Other'}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'az' ? 'Qeydlər (İstəyə görə)' : 'Notes / Memo (Optional)'}</span>
            </label>
            <textarea
              id="tx-notes-input"
              rows={2}
              placeholder={language === 'az' ? 'Əlavə təfərrüatlar...' : 'Additional notes...'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* C# DTO Code Hint */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
            <span>C# DTO: <span className="text-indigo-600 font-bold">{editingTransaction ? 'UpdateExpenseDto' : 'CreateExpenseDto'}</span></span>
            <span className="text-emerald-600 font-bold">[HttpPost("api/expenses")]</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-save-transaction"
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>
                {editingTransaction
                  ? (language === 'az' ? 'Dəyişiklikləri Yadda Saxla' : 'Save Changes')
                  : (type === 'income' 
                      ? (language === 'az' ? 'Gəliri Əlavə Et' : 'Add Income') 
                      : (language === 'az' ? 'Xərci Əlavə Et' : 'Add Expense'))}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
