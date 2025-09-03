'use client';

import { useState, useEffect } from 'react';
import { RecurringTransaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, Edit2, Trash2, Calendar, Play, Pause } from 'lucide-react';
import { 
  getRecurringTransactions, 
  addRecurringTransaction, 
  updateRecurringTransaction, 
  deleteRecurringTransaction,
  getNextOccurrence 
} from '@/lib/recurring-storage';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

interface RecurringTransactionsProps {
  onAddTransaction: (transaction: Omit<import('@/types/transaction').Transaction, 'id'>) => void;
}

export function RecurringTransactions({ onAddTransaction }: RecurringTransactionsProps) {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'expense' as RecurringTransaction['type'],
    category: '',
    frequency: 'monthly' as RecurringTransaction['frequency'],
    nextDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  useEffect(() => {
    setTransactions(getRecurringTransactions());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      amount: Number(formData.amount),
      description: formData.description,
      type: formData.type,
      category: formData.category,
      frequency: formData.frequency,
      nextDate: formData.nextDate,
      isActive: formData.isActive,
    };

    if (editingTransaction) {
      updateRecurringTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
    } else {
      addRecurringTransaction(transactionData);
    }

    setTransactions(getRecurringTransactions());
    setShowForm(false);
    setFormData({
      amount: '',
      description: '',
      type: 'expense',
      category: '',
      frequency: 'monthly',
      nextDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      type: transaction.type,
      category: transaction.category,
      frequency: transaction.frequency,
      nextDate: transaction.nextDate,
      isActive: transaction.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteRecurringTransaction(id);
    setTransactions(getRecurringTransactions());
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive });
    setTransactions(getRecurringTransactions());
  };

  const handleExecuteTransaction = (recurring: RecurringTransaction) => {
    // Add the transaction to the main transaction list
    onAddTransaction({
      amount: recurring.amount,
      description: recurring.description,
      type: recurring.type,
      category: recurring.category,
      date: new Date().toISOString().split('T')[0],
    });

    // Update the next occurrence date
    const nextDate = getNextOccurrence(recurring.frequency, recurring.nextDate);
    updateRecurringTransaction(recurring.id, { nextDate });
    setTransactions(getRecurringTransactions());
  };

  const availableCategories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const getDueSoon = () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return transactions.filter(t => {
      const nextDate = new Date(t.nextDate);
      return t.isActive && nextDate <= threeDaysFromNow;
    });
  };

  const dueSoon = getDueSoon();

  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cyan-300">
            <RefreshCw className="h-5 w-5" />
            Recurring Transactions
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Recurring
          </Button>
        </div>
        {dueSoon.length > 0 && (
          <div className="mt-2">
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
              {dueSoon.length} transaction{dueSoon.length > 1 ? 's' : ''} due soon
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="recurring-amount">Amount</Label>
                <Input
                  id="recurring-amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="recurring-type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value, category: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recurring-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recurring-frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recurring-description">Description</Label>
                <Input
                  id="recurring-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Netflix subscription"
                  required
                />
              </div>
              <div>
                <Label htmlFor="recurring-next-date">Next Date</Label>
                <Input
                  id="recurring-next-date"
                  type="date"
                  value={formData.nextDate}
                  onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                {editingTransaction ? 'Update' : 'Add'} Recurring Transaction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                  setFormData({
                    amount: '',
                    description: '',
                    type: 'expense',
                    category: '',
                    frequency: 'monthly',
                    nextDate: new Date().toISOString().split('T')[0],
                    isActive: true,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-200">No recurring transactions set up</p>
              <p className="text-sm text-cyan-300/70">Add recurring transactions to automate your finance tracking</p>
            </div>
          ) : (
            transactions.map((transaction) => {
              const nextDate = new Date(transaction.nextDate);
              const today = new Date();
              const isOverdue = nextDate < today && transaction.isActive;
              const isDueSoon = nextDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) && transaction.isActive;
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={transaction.isActive}
                        onCheckedChange={(checked) => handleToggleActive(transaction.id, checked)}
                      />
                      {transaction.isActive ? (
                        <Play className="h-3 w-3 text-green-400" />
                      ) : (
                        <Pause className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-cyan-100">{transaction.description}</p>
                        <Badge 
                          variant={transaction.type === 'income' ? 'default' : 'secondary'}
                          className={transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'}
                        >
                          {transaction.type}
                        </Badge>
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                          {transaction.frequency}
                        </Badge>
                        {isOverdue && (
                          <Badge className="bg-red-500 text-white">Overdue</Badge>
                        )}
                        {isDueSoon && !isOverdue && (
                          <Badge className="bg-yellow-500 text-white">Due Soon</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-cyan-300/70">
                        <Calendar className="h-3 w-3" />
                        <span>Next: {nextDate.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      {transaction.isActive && (isDueSoon || isOverdue) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExecuteTransaction(transaction)}
                          className="h-8 w-8 p-0 hover:bg-green-500/20 hover:text-green-400"
                          title="Execute now"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(transaction)}
                        className="h-8 w-8 p-0 hover:bg-cyan-500/20"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(transaction.id)}
                        className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}