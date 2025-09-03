import { RecurringTransaction } from '@/types/transaction';

const RECURRING_STORAGE_KEY = 'finance-recurring';

export function getRecurringTransactions(): RecurringTransaction[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECURRING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRecurringTransactions(transactions: RecurringTransaction[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save recurring transactions:', error);
  }
}

export function addRecurringTransaction(transaction: Omit<RecurringTransaction, 'id'>): RecurringTransaction {
  const newTransaction: RecurringTransaction = {
    ...transaction,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  
  const transactions = getRecurringTransactions();
  transactions.push(newTransaction);
  saveRecurringTransactions(transactions);
  
  return newTransaction;
}

export function updateRecurringTransaction(id: string, updates: Partial<Omit<RecurringTransaction, 'id'>>): void {
  const transactions = getRecurringTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveRecurringTransactions(transactions);
  }
}

export function deleteRecurringTransaction(id: string): void {
  const transactions = getRecurringTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveRecurringTransactions(filtered);
}

export function getNextOccurrence(frequency: RecurringTransaction['frequency'], lastDate: string): string {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}