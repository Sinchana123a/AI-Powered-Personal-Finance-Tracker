import { Transaction, MonthlyExpense, CategoryExpense, CATEGORY_COLORS } from '@/types/transaction';

export function getMonthlyExpenses(transactions: Transaction[]): MonthlyExpense[] {
  const monthlyData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
    });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: formatMonthLabel(month),
      amount,
    }))
    .slice(-6); // Show last 6 months
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCategoryExpenses(transactions: Transaction[]): CategoryExpense[] {
  const categoryData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const category = transaction.category || 'Other';
      categoryData[category] = (categoryData[category] || 0) + transaction.amount;
    });

  return Object.entries(categoryData)
    .map(([category, amount]) => ({
      category,
      amount,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#85C1E9',
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  return transactions.filter(t => t.date.startsWith(currentMonth));
}