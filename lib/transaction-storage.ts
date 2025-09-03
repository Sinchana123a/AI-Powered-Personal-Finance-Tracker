import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'finance-transactions';

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save transactions:', error);
  }
}

export function addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
  const newTransaction: Transaction = {
    ...transaction,
    category: transaction.category || 'Other',
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  
  const transactions = getTransactions();
  transactions.push(newTransaction);
  saveTransactions(transactions);
  
  return newTransaction;
}

export function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): void {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveTransactions(transactions);
  }
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
}