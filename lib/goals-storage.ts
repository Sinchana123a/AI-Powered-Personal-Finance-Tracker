import { FinancialGoal } from '@/types/transaction';

const GOALS_STORAGE_KEY = 'finance-goals';

export function getGoals(): FinancialGoal[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveGoals(goals: FinancialGoal[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Failed to save goals:', error);
  }
}

export function addGoal(goal: Omit<FinancialGoal, 'id'>): FinancialGoal {
  const newGoal: FinancialGoal = {
    ...goal,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  
  const goals = getGoals();
  goals.push(newGoal);
  saveGoals(goals);
  
  return newGoal;
}

export function updateGoal(id: string, updates: Partial<Omit<FinancialGoal, 'id'>>): void {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === id);
  
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    saveGoals(goals);
  }
}

export function deleteGoal(id: string): void {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  saveGoals(filtered);
}