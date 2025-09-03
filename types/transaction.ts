export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM format
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Investment',
  'Insurance',
  'Taxes',
  'Subscriptions',
  'Other'
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Rental',
  'Dividend',
  'Bonus',
  'Gift',
  'Other'
] as const;

export const CATEGORY_COLORS = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4',
  'Shopping': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Bills & Utilities': '#FFEAA7',
  'Healthcare': '#DDA0DD',
  'Travel': '#98D8C8',
  'Education': '#F7DC6F',
  'Personal Care': '#BB8FCE',
  'Investment': '#8E44AD',
  'Insurance': '#E74C3C',
  'Taxes': '#34495E',
  'Subscriptions': '#16A085',
  'Other': '#85C1E9',
  'Salary': '#2ECC71',
  'Freelance': '#3498DB',
  'Business': '#E67E22',
  'Rental': '#27AE60',
  'Dividend': '#9B59B6',
  'Bonus': '#F39C12',
  'Gift': '#1ABC9C',
} as const;