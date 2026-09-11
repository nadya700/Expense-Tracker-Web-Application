import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  Category, 
  User, 
  FinancialSummary, 
  ApiCallLog, 
  AppView, 
  TransactionType,
  BudgetStatus
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
  notification: { message: string; type: 'success' | 'info' | 'error' | 'warning'; title?: string } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error' | 'warning', title?: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
  isBudgetModalOpen: boolean;
  setIsBudgetModalOpen: (open: boolean) => void;
  updateBudget: (monthlyBudget: number, threshold?: number, enableAlerts?: boolean) => void;
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
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultModalType, setDefaultModalType] = useState<TransactionType>('expense');

  // Notifications
  const [notification, setNotification] = useState<{ 
    message: string; 
    type: 'success' | 'info' | 'error' | 'warning';
    title?: string;
  } | null>(null);

  const showNotification = (
    message: string, 
    type: 'success' | 'info' | 'error' | 'warning' = 'success',
    title?: string
  ) => {
    setNotification({ message, type, title });
    // Keep warnings visible longer (6.5 seconds) so financial alerts are not missed
    const duration = type === 'warning' ? 6500 : 4000;
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, duration);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('expense_tracker_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('expense_tracker_user', JSON.stringify(user));
  }, [user]);

  // Update budget function
  const updateBudget = (newMonthlyBudget: number, newThreshold?: number, enableAlerts?: boolean) => {
    const updatedUser: User = {
      ...user,
      monthlyBudget: newMonthlyBudget,
      budgetWarningThreshold: newThreshold ?? user.budgetWarningThreshold ?? 80,
      enableBudgetAlerts: enableAlerts ?? user.enableBudgetAlerts ?? true,
    };
    setUser(updatedUser);
    localStorage.setItem('expense_tracker_user', JSON.stringify(updatedUser));

    // Evaluate current expenses against new budget
    const currExpense = summary.budgetStatus.currentMonthExpense;
    const threshold = updatedUser.budgetWarningThreshold ?? 80;
    const percent = Math.round((currExpense / newMonthlyBudget) * 1000) / 10;
    const curr = updatedUser.currency || '₼';

    if (currExpense >= newMonthlyBudget && updatedUser.enableBudgetAlerts !== false) {
      const overBy = (currExpense - newMonthlyBudget).toFixed(2);
      showNotification(
        language === 'az'
          ? `🚨 DİQQƏT: Yeni təyin olunan büdcə limiti (${newMonthlyBudget} ${curr}) cari xərclərinizlə artıq aşılıb! (Aşma: +${overBy} ${curr})`
          : `🚨 WARNING: Current expenses already exceed the new monthly budget limit (${newMonthlyBudget} ${curr}) by +${overBy} ${curr}!`,
        'warning',
        language === 'az' ? 'Büdcə Limiti Aşıldı!' : 'Budget Exceeded!'
      );
    } else if (percent >= threshold && updatedUser.enableBudgetAlerts !== false) {
      const left = (newMonthlyBudget - currExpense).toFixed(2);
      showNotification(
        language === 'az'
          ? `⚠️ XƏBƏRDARLIQ: Xərcləriniz yeni büdcə limitinin ${percent}%-nə çatıb! Qalan: ${left} ${curr}.`
          : `⚠️ WARNING: Current expenses reach ${percent}% of new budget limit! Remaining: ${left} ${curr}.`,
        'warning',
        language === 'az' ? 'Büdcə Limitinə Yaxınlaşır' : 'Approaching Budget Limit'
      );
    } else {
      showNotification(
        language === 'az' ? 'Aylıq büdcə limiti uğurla yeniləndi' : 'Monthly budget limit updated successfully',
        'success'
      );
    }
  };

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

    // Current month calculation
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    let currentMonthExpense = 0;

    userTxs.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeCount++;
      } else {
        totalExpense += tx.amount;
        expenseCount++;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;

        const txDate = new Date(tx.date);
        if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
          currentMonthExpense += tx.amount;
        }
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

    // Effective monthly expense: if transactions match current calendar month, use that;
    // fallback to totalExpense if sample data is from a different test date
    const evaluatedMonthlyExpense = currentMonthExpense > 0 ? currentMonthExpense : totalExpense;
    const monthlyBudget = user.monthlyBudget || 1500;
    const thresholdPercent = user.budgetWarningThreshold ?? 80;
    const percentUsed = Math.round((evaluatedMonthlyExpense / monthlyBudget) * 1000) / 10;
    const isExceeded = evaluatedMonthlyExpense >= monthlyBudget;
    const isApproaching = !isExceeded && percentUsed >= thresholdPercent;
    const remainingBudget = Math.max(0, monthlyBudget - evaluatedMonthlyExpense);
    const overBudgetAmount = Math.max(0, evaluatedMonthlyExpense - monthlyBudget);

    const budgetStatus: BudgetStatus = {
      monthlyBudget,
      currentMonthExpense: evaluatedMonthlyExpense,
      totalExpense,
      percentUsed,
      isApproaching,
      isExceeded,
      remainingBudget,
      overBudgetAmount,
      thresholdPercent,
    };

    return {
      totalIncome,
      totalExpense,
      currentMonthExpense: evaluatedMonthlyExpense,
      netBalance,
      savingsRate: Math.max(0, Math.round(savingsRate * 10) / 10),
      expenseCount,
      incomeCount,
      topExpenseCategory: topCat,
      budgetStatus,
    };
  }, [transactions, user.id, user.monthlyBudget, user.budgetWarningThreshold]);

  // CRUD handlers with C# API logging
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Budget Limit check for expenses
    const monthlyBudget = user.monthlyBudget || 1500;
    const threshold = user.budgetWarningThreshold ?? 80;
    const prevExpense = summary.budgetStatus.currentMonthExpense;
    const curr = user.currency || '₼';

    let budgetWarningHeader = 'OK';

    if (newTx.type === 'expense' && user.enableBudgetAlerts !== false) {
      const projectedExpense = prevExpense + newTx.amount;
      const projectedPercent = Math.round((projectedExpense / monthlyBudget) * 1000) / 10;

      if (projectedExpense >= monthlyBudget) {
        budgetWarningHeader = 'EXCEEDED';
        const overBy = (projectedExpense - monthlyBudget).toFixed(2);
        showNotification(
          language === 'az'
            ? `🚨 DİQQƏT: Aylıq büdcə limiti aşıldı! (${projectedExpense.toFixed(2)} ${curr} / ${monthlyBudget} ${curr} — ${projectedPercent}%). Aşma: +${overBy} ${curr}.`
            : `🚨 WARNING: Monthly budget limit exceeded! (${projectedExpense.toFixed(2)} ${curr} / ${monthlyBudget} ${curr} — ${projectedPercent}%). Exceeded by +${overBy} ${curr}.`,
          'warning',
          language === 'az' ? 'Büdcə Limiti Aşıldı!' : 'Budget Exceeded!'
        );
      } else if (projectedPercent >= threshold) {
        budgetWarningHeader = 'APPROACHING_LIMIT';
        const left = (monthlyBudget - projectedExpense).toFixed(2);
        showNotification(
          language === 'az'
            ? `⚠️ XƏBƏRDARLIQ: Aylıq büdcə limitinə yaxınlaşırsınız! Xərclər: ${projectedPercent}%. Qalan büdcə: ${left} ${curr}.`
            : `⚠️ WARNING: Approaching monthly budget limit! Spent: ${projectedPercent}%. Remaining: ${left} ${curr}.`,
          'warning',
          language === 'az' ? 'Büdcə Limitinə Yaxınlaşır' : 'Approaching Limit'
        );
      } else {
        showNotification(
          language === 'az' 
            ? `"${newTx.title}" uğurla əlavə edildi!` 
            : `"${newTx.title}" added successfully!`,
          'success'
        );
      }
    } else {
      showNotification(
        language === 'az' 
          ? `"${newTx.title}" uğurla əlavə edildi!` 
          : `"${newTx.title}" added successfully!`,
        'success'
      );
    }

    // Record C# API mapping log
    addApiLog({
      method: 'POST',
      endpoint: '/api/expenses',
      csharpController: 'ExpensesController.cs',
      csharpMethod: `public async Task<ActionResult<ExpenseResponseDto>> CreateExpense([FromBody] CreateExpenseDto dto) // [BudgetCheck: ${budgetWarningHeader}]`,
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
      responseBody: { ...newTx, budgetStatus: budgetWarningHeader },
      sqlEquivalent: `INSERT INTO Expenses (Id, Title, Amount, Type, Category, Date, PaymentMethod, Notes, UserId, CreatedAt) VALUES ('${newTx.id}', '${newTx.title.replace(/'/g, "''")}', ${newTx.amount}, '${newTx.type}', '${newTx.category}', '${newTx.date}', '${newTx.paymentMethod}', '${newTx.notes ?? ''}', '${user.id}', datetime('now'));`,
    });
  };

  const updateTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    const existing = transactions.find(t => t.id === id);
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t)));

    // Budget Limit check if updating amount or type to expense
    const monthlyBudget = user.monthlyBudget || 1500;
    const threshold = user.budgetWarningThreshold ?? 80;
    const curr = user.currency || '₼';

    if (user.enableBudgetAlerts !== false && (updatedFields.amount !== undefined || updatedFields.type !== undefined)) {
      const oldAmount = (existing?.type === 'expense' ? existing.amount : 0);
      const newAmount = (updatedFields.type ?? existing?.type) === 'expense' 
        ? (updatedFields.amount ?? existing?.amount ?? 0) 
        : 0;
      const netChange = newAmount - oldAmount;
      const projectedExpense = summary.budgetStatus.currentMonthExpense + netChange;
      const projectedPercent = Math.round((projectedExpense / monthlyBudget) * 1000) / 10;

      if (projectedExpense >= monthlyBudget && netChange > 0) {
        showNotification(
          language === 'az'
            ? `🚨 DİQQƏT: Redaktədən sonra aylıq büdcə limiti aşıldı! (${projectedExpense.toFixed(2)} ${curr} / ${monthlyBudget} ${curr} — ${projectedPercent}%)`
            : `🚨 WARNING: Monthly budget limit exceeded after update! (${projectedExpense.toFixed(2)} ${curr} / ${monthlyBudget} ${curr} — ${projectedPercent}%)`,
          'warning'
        );
      } else if (projectedPercent >= threshold && netChange > 0) {
        showNotification(
          language === 'az'
            ? `⚠️ XƏBƏRDARLIQ: Xərcləriniz büdcə limitinin ${projectedPercent}%-nə çatdı!`
            : `⚠️ WARNING: Expenses reach ${projectedPercent}% of monthly budget limit!`,
          'warning'
        );
      } else {
        showNotification(
          language === 'az' ? 'Məlumat yeniləndi' : 'Transaction updated successfully',
          'info'
        );
      }
    } else {
      showNotification(
        language === 'az' ? 'Məlumat yeniləndi' : 'Transaction updated successfully',
        'info'
      );
    }

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
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        updateBudget,
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
