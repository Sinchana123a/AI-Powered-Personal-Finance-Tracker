'use client';

import { useState, useEffect } from 'react';
import { Transaction, Budget } from '@/types/transaction';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { MonthlyExpensesChart } from '@/components/monthly-expenses-chart';
import { CategoryPieChart } from '@/components/category-pie-chart';
import { BudgetForm } from '@/components/budget-form';
import { BudgetComparisonChart } from '@/components/budget-comparison-chart';
import { SummaryCards } from '@/components/summary-cards';
import { SpendingInsights } from '@/components/spending-insights';
import { AITransactionGenerator } from '@/components/ai-transaction-generator';
import { FinancialGoals } from '@/components/financial-goals';
import { RecurringTransactions } from '@/components/recurring-transactions';
import { ExpenseTrends } from '@/components/expense-trends';
import { AIExportImport } from '@/components/ai-export-import';
import { AIInsightsDashboard } from '@/components/ai-insights-dashboard';
import { SmartCategorization } from '@/components/smart-categorization';
import { FinancialHealthScore } from '@/components/financial-health-score';
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '@/lib/transaction-storage';
import { 
  addBudget, 
  getCurrentMonthBudgets 
} from '@/lib/budget-storage';
import { getMonthlyExpenses, getCategoryExpenses } from '@/lib/chart-data';
import { Wallet } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
    setBudgets(getCurrentMonthBudgets());
  }, []);

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
    } else {
      addTransaction(transactionData);
    }
    setTransactions(getTransactions());
  };

  const handleAddMultipleTransactions = (transactionsData: Omit<Transaction, 'id'>[]) => {
    transactionsData.forEach(transactionData => {
      addTransaction(transactionData);
    });
    setTransactions(getTransactions());
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    setTransactions(getTransactions());
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleAddBudget = (budgetData: Omit<Budget, 'id'>) => {
    addBudget(budgetData);
    setBudgets(getCurrentMonthBudgets());
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    updateTransaction(id, updates);
    setTransactions(getTransactions());
  };

  const monthlyExpenses = getMonthlyExpenses(transactions);
  const categoryExpenses = getCategoryExpenses(transactions);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-6 py-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/20 rounded-xl border border-primary/30 backdrop-blur-sm">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                AI Finance Tracker
              </h1>
              <p className="text-muted-foreground">Smart personal finance management with AI-powered insights</p>
            </div>
          </div>
        </div>

        {/* Summary Cards - Full Width */}
        <div className="mb-8">
          <SummaryCards transactions={transactions} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left Sidebar - Forms and Tools */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <TransactionForm
              onSubmit={handleAddTransaction}
              editingTransaction={editingTransaction}
              onCancelEdit={handleCancelEdit}
            />
            <AITransactionGenerator onAddTransactions={handleAddMultipleTransactions} />
            <BudgetForm onSubmit={handleAddBudget} existingBudgets={budgets} />
            <AIExportImport onImportTransactions={handleAddMultipleTransactions} />
          </div>

          {/* Center Content - Charts and Analytics */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Top Row - Main Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MonthlyExpensesChart data={monthlyExpenses} />
              <CategoryPieChart data={categoryExpenses} />
            </div>
            
            {/* Second Row - Budget and Trends */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <BudgetComparisonChart transactions={transactions} budgets={budgets} />
              <ExpenseTrends transactions={transactions} />
            </div>

            {/* AI Insights Dashboard - Full Width */}
            <AIInsightsDashboard transactions={transactions} budgets={budgets} />
          </div>

          {/* Right Sidebar - Goals and Management */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <FinancialHealthScore transactions={transactions} budgets={budgets} />
            <FinancialGoals />
            <RecurringTransactions onAddTransaction={handleAddTransaction} />
            <SmartCategorization 
              transactions={transactions} 
              onUpdateTransaction={handleUpdateTransaction}
            />
            <SpendingInsights transactions={transactions} budgets={budgets} />
          </div>
        </div>
        
        {/* Transaction List - Full Width Bottom */}
        <div className="mt-8">
          <TransactionList
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>
      </div>
    </div>
  );
}