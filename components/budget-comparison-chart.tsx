'use client';

import { Transaction, Budget } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { getCurrentMonthTransactions } from '@/lib/chart-data';

interface BudgetComparisonChartProps {
  transactions: Transaction[];
  budgets: Budget[];
}

interface BudgetData {
  category: string;
  budget: number;
  actual: number;
  remaining: number;
}

export function BudgetComparisonChart({ transactions, budgets }: BudgetComparisonChartProps) {
  const currentMonthTransactions = getCurrentMonthTransactions(transactions);
  
  const budgetData: BudgetData[] = budgets.map(budget => {
    const categoryExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      category: budget.category,
      budget: budget.amount,
      actual: categoryExpenses,
      remaining: Math.max(0, budget.amount - categoryExpenses),
    };
  });

  if (budgetData.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Budget vs Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No budgets set</h3>
          <p className="text-sm text-muted-foreground">Set monthly budgets to track your spending against your goals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Budget vs Actual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="category" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'budget' ? 'Budget' : name === 'actual' ? 'Spent' : 'Remaining']}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '500' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)'
                }}
              />
              <Legend />
              <Bar dataKey="budget" fill="#3B82F6" name="Budget" radius={[2, 2, 0, 0]} />
              <Bar dataKey="actual" fill="#EF4444" name="Spent" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Budget Status Summary */}
        <div className="mt-4 space-y-2">
          {budgetData.map((item) => {
            const percentage = (item.actual / item.budget) * 100;
            const isOverBudget = percentage > 100;
            
            return (
              <div key={item.category} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ${item.actual.toFixed(2)} / ${item.budget.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}