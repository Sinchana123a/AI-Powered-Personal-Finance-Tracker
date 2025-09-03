'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Budget, EXPENSE_CATEGORIES } from '@/types/transaction';
import { Target, Plus } from 'lucide-react';

interface BudgetFormProps {
  onSubmit: (budget: Omit<Budget, 'id'>) => void;
  existingBudgets: Budget[];
}

export function BudgetForm({ onSubmit, existingBudgets }: BudgetFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const existingCategories = existingBudgets.map(b => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter(cat => !existingCategories.includes(cat));

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      amount: Number(amount),
      category,
      month: currentMonth,
    });

    setAmount('');
    setCategory('');
    setErrors({});
  };

  if (availableCategories.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">All categories have budgets set for this month.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Set Monthly Budget
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget-amount">Budget Amount</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`bg-background/50 ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="flex items-center gap-2 w-full bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Set Budget
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}