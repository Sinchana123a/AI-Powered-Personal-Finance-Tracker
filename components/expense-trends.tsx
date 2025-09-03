'use client';

import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExpenseTrendsProps {
  transactions: Transaction[];
}

interface TrendData {
  date: string;
  amount: number;
  income: number;
  expense: number;
  balance: number;
}

export function ExpenseTrends({ transactions }: ExpenseTrendsProps) {
  const getLast30DaysData = (): TrendData[] => {
    const data: { [key: string]: { income: number; expense: number } } = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    // Initialize all days with 0
    last30Days.forEach(date => {
      data[date] = { income: 0, expense: 0 };
    });

    // Populate with actual transaction data
    transactions.forEach(transaction => {
      if (data[transaction.date]) {
        if (transaction.type === 'income') {
          data[transaction.date].income += transaction.amount;
        } else {
          data[transaction.date].expense += transaction.amount;
        }
      }
    });

    let runningBalance = 0;
    return last30Days.map(date => {
      const dayData = data[date];
      const netAmount = dayData.income - dayData.expense;
      runningBalance += netAmount;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: netAmount,
        income: dayData.income,
        expense: dayData.expense,
        balance: runningBalance,
      };
    });
  };

  const trendData = getLast30DaysData();
  const totalIncome = trendData.reduce((sum, day) => sum + day.income, 0);
  const totalExpenses = trendData.reduce((sum, day) => sum + day.expense, 0);
  const netChange = totalIncome - totalExpenses;
  const avgDailySpending = totalExpenses / 30;

  // Calculate trend direction
  const firstWeekAvg = trendData.slice(0, 7).reduce((sum, day) => sum + day.expense, 0) / 7;
  const lastWeekAvg = trendData.slice(-7).reduce((sum, day) => sum + day.expense, 0) / 7;
  const trendDirection = lastWeekAvg > firstWeekAvg ? 'up' : 'down';
  const trendPercentage = Math.abs(((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100);

  if (transactions.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Expense Trends (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No trend data available</h3>
          <p className="text-sm text-muted-foreground">Add transactions to see your spending trends over time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Expense Trends (30 Days)
        </CardTitle>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            {trendDirection === 'up' ? (
              <TrendingUp className="h-4 w-4 text-red-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-400" />
            )}
            <Badge 
              variant="outline" 
              className={trendDirection === 'up' ? 'border-red-500/30 text-red-300' : 'border-green-500/30 text-green-300'}
            >
              {trendDirection === 'up' ? '+' : '-'}{trendPercentage.toFixed(1)}% vs last week
            </Badge>
          </div>
          <Badge variant="outline" className="border-blue-500/30 text-blue-300">
            Avg: ${avgDailySpending.toFixed(2)}/day
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`, 
                  name === 'income' ? 'Income' : name === 'expense' ? 'Expenses' : 'Balance'
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '500' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)'
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                fill="url(#incomeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                fill="url(#expenseGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-300 mb-1">Total Income</p>
            <p className="text-lg font-semibold text-green-400">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-300 mb-1">Total Expenses</p>
            <p className="text-lg font-semibold text-red-400">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${
            netChange >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
          }`}>
            <p className={`text-sm mb-1 ${netChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              Net Change
            </p>
            <p className={`text-lg font-semibold ${netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netChange >= 0 ? '+' : ''}${netChange.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}