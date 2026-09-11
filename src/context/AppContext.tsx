import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  Category, 
  User, 
  FinancialSummary, 
  ApiCallLog, 
  AppView, 
  TransactionType 
} from '../types';
import { CATEGORIES, DEFAULT_USER, INITIAL_TRANSACTIONS } from '../data/initialData';

interface AppContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  language: 'az' | 'en';
  setLanguage: (lang: 'az' | 'en') => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  resetToSampleData: () => void;
  summary: FinancialSummary;
  currency: string;
  setCurrency: (c: string) => void;
  apiLogs: ApiCallLog[];
  clearApiLogs: () => void;
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  defaultModalType: TransactionType;
  openNewTransactionModal: (type?: TransactionType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'az' | 'en'>('az');
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  
  // User auth state
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('expense_tracker_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Currency
  const currency = user.currency || '₼';
  const setCurrency = (newCurr: string) => {
    setUser(prev => {
      const updated = { ...prev, currency: newCurr };
      localStorage.setItem('expense_tracker_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('expense_tracker_txs');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultModalType, setDefaultModalType] = useState<TransactionType>('expense');

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('expense_tracker_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('expense_tracker_user', JSON.stringify(user));
  }, [user]);

  // C# API Log Tracker
  const [apiLogs, setApiLogs] = useState<ApiCallLog[]>(() => [
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      method: 'GET',
      endpoint: '/api/expenses?userId=' + user.id,
      csharpController: 'ExpensesController.cs',
      csharpMethod: 'public async Task<ActionResult<IEnumerable<ExpenseResponseDto>>> GetExpenses(...)',
      responseStatus: 200,
      responseBody: { count: INITIAL_TRANSACTIONS.length, status: 'Success' },
      sqlEquivalent: `SELECT * FROM Expenses WHERE UserId = '${user.id}' ORDER BY Date DESC;`,
    }
  ]);

  const addApiLog = (log: Omit<ApiCallLog, 'id' | 'timestamp'>) => {
    setApiLogs(prev => [
      {
        ...log,
        id: 'log-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 24), // keep last 25 logs
    ]);
  };

  const clearApiLogs = () => setApiLogs([]);

  // Calculations
  const summary: FinancialSummary = useMemo(() => {
    const userTxs = transactions.filter(t => t.userId === user.id);
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    const catMap: Record<string, number> = {};

    userTxs.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeCount++;
      } else {
        totalExpense += tx.amount;
        expenseCount++;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    let topCat = 'food';
    let maxCatVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxCatVal) {
        maxCatVal = val;
        topCat = cat;
      }
    });

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate: Math.max(0, Math.round(savingsRate * 10) / 10),
      expenseCount,
      incomeCount,
      topExpenseCategory: topCat,
    };
  }, [transactions, user.id]);

  // CRUD handlers with C# API logging
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Record C# API mapping log
    addApiLog({
      method: 'POST',
      endpoint: '/api/expenses',
      csharpController: 'ExpensesController.cs',
      csharpMethod: 'public async Task<ActionResult<ExpenseResponseDto>> CreateExpense([FromBody] CreateExpenseDto dto)',
      requestBody: {
        title: newTx.title,
        amount: newTx.amount,
        type: newTx.type,
        category: newTx.category,
        date: newTx.date,
        paymentMethod: newTx.paymentMethod,
        notes: newTx.notes,
      },
      responseStatus: 201,
      responseBody: newTx,
      sqlEquivalent: `INSERT INTO Expenses (Id, Title, Amount, Type, Category, Date, PaymentMethod, Notes, UserId, CreatedAt) VALUES ('${newTx.id}', '${newTx.title.replace(/'/g, "''")}', ${newTx.amount}, '${newTx.type}', '${newTx.category}', '${newTx.date}', '${newTx.paymentMethod}', '${newTx.notes ?? ''}', '${user.id}', datetime('now'));`,
    });

    showNotification(
      language === 'az' 
        ? `"${newTx.title}" uğurla əlavə edildi!` 
        : `"${newTx.title}" added successfully!`,
      'success'
    );
  };

  const updateTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t)));

    addApiLog({
      method: 'PUT',
      endpoint: `/api/expenses/${id}`,
      csharpController: 'ExpensesController.cs',
      csharpMethod: 'public async Task<IActionResult> UpdateExpense(string id, [FromBody] UpdateExpenseDto dto)',
      requestBody: updatedFields,
      responseStatus: 204,
      responseBody: { status: 'NoContent', message: 'Updated successfully' },
      sqlEquivalent: `UPDATE Expenses SET ${Object.keys(updatedFields).map(k => `${k} = ...`).join(', ')} WHERE Id = '${id}' AND UserId = '${user.id}';`,
    });

    showNotification(
      language === 'az' ? 'Məlumat yeniləndi' : 'Transaction updated successfully',
      'info'
    );
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));

    addApiLog({
      method: 'DELETE',
      endpoint: `/api/expenses/${id}`,
      csharpController: 'ExpensesController.cs',
      csharpMethod: 'public async Task<IActionResult> DeleteExpense(string id)',
      responseStatus: 200,
      responseBody: { success: true, message: 'Deleted' },
      sqlEquivalent: `DELETE FROM Expenses WHERE Id = '${id}' AND UserId = '${user.id}';`,
    });

    showNotification(
      language === 'az' 
        ? `"${tx?.title || 'Qeyd'}" silindi` 
        : `"${tx?.title || 'Record'}" deleted`,
      'info'
    );
  };

  const resetToSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.setItem('expense_tracker_txs', JSON.stringify(INITIAL_TRANSACTIONS));
    showNotification(
      language === 'az' ? 'Baza nümunə məlumatlara bərpa edildi' : 'Reset to initial sample data',
      'info'
    );
  };

  const openNewTransactionModal = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setDefaultModalType(type);
    setIsTransactionModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage,
        activeView,
        setActiveView,
        transactions,
        categories: CATEGORIES,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        resetToSampleData,
        summary,
        currency,
        setCurrency,
        apiLogs,
        clearApiLogs,
        notification,
        showNotification,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isTransactionModalOpen,
        setIsTransactionModalOpen,
        editingTransaction,
        setEditingTransaction,
        defaultModalType,
        openNewTransactionModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
