export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  userId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAz: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  avatarUrl?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  expenseCount: number;
  incomeCount: number;
  topExpenseCategory: string;
}

export interface CSharpSourceFile {
  id: string;
  fileName: string;
  folder: string;
  description: string;
  descriptionAz: string;
  language: string;
  code: string;
}

export interface ApiCallLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  csharpController: string;
  csharpMethod: string;
  requestBody?: any;
  responseStatus: number;
  responseBody: any;
  sqlEquivalent: string;
}

export type AppView = 'dashboard' | 'transactions' | 'reports' | 'csharp_backend' | 'task_guide';
