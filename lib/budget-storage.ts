import { Budget } from '@/types/transaction';

const BUDGET_STORAGE_KEY = 'finance-budgets';

export function getBudgets(): Budget[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveBudgets(budgets: Budget[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Failed to save budgets:', error);
  }
}

export function addBudget(budget: Omit<Budget, 'id'>): Budget {
  const newBudget: Budget = {
    ...budget,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  
  const budgets = getBudgets();
  // Remove existing budget for same category and month
  const filtered = budgets.filter(b => !(b.category === budget.category && b.month === budget.month));
  filtered.push(newBudget);
  saveBudgets(filtered);
  
  return newBudget;
}

export function updateBudget(id: string, updates: Partial<Omit<Budget, 'id'>>): void {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...updates };
    saveBudgets(budgets);
  }
}

export function deleteBudget(id: string): void {
  const budgets = getBudgets();
  const filtered = budgets.filter(b => b.id !== id);
  saveBudgets(filtered);
}

export function getCurrentMonthBudgets(): Budget[] {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  return getBudgets().filter(b => b.month === currentMonth);
}