'use client';

import { Transaction, Budget } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { getCurrentMonthTransactions, getCategoryExpenses } from '@/lib/chart-data';

interface SpendingInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const currentMonthTransactions = getCurrentMonthTransactions(transactions);
  const categoryExpenses = getCategoryExpenses(currentMonthTransactions);
  
  const insights: Array<{
    type: 'warning' | 'success' | 'info';
    message: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [];

  // Budget-related insights
  budgets.forEach(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = (spent / budget.amount) * 100;
    
    if (percentage > 100) {
      insights.push({
        type: 'warning',
        message: `You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)} (${percentage.toFixed(0)}%)`,
        icon: AlertTriangle,
      });
    } else if (percentage > 80) {
      insights.push({
        type: 'warning',
        message: `You're at ${percentage.toFixed(0)}% of your ${budget.category} budget with $${(budget.amount - spent).toFixed(2)} remaining`,
        icon: AlertTriangle,
      });
    } else if (percentage < 50) {
      insights.push({
        type: 'success',
        message: `Great job! You're only at ${percentage.toFixed(0)}% of your ${budget.category} budget`,
        icon: CheckCircle,
      });
    }
  });

  // Spending pattern insights
  if (categoryExpenses.length > 0) {
    const topCategory = categoryExpenses[0];
    const totalExpenses = categoryExpenses.reduce((sum, cat) => sum + cat.amount, 0);
    const topCategoryPercentage = (topCategory.amount / totalExpenses) * 100;
    
    if (topCategoryPercentage > 40) {
      insights.push({
        type: 'info',
        message: `${topCategory.category} accounts for ${topCategoryPercentage.toFixed(0)}% of your spending this month`,
        icon: TrendingUp,
      });
    }
  }

  // Transaction frequency insights
  const thisWeekTransactions = currentMonthTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactionDate >= weekAgo;
  });

  if (thisWeekTransactions.length > 15) {
    insights.push({
      type: 'info',
      message: `You've made ${thisWeekTransactions.length} transactions this week - consider consolidating purchases`,
      icon: Lightbulb,
    });
  }

  // Income vs expenses insight
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (monthlyIncome > 0) {
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
    
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        message: `Excellent! You're saving ${savingsRate.toFixed(0)}% of your income this month`,
        icon: CheckCircle,
      });
    } else if (savingsRate < 0) {
      insights.push({
        type: 'warning',
        message: `You're spending $${Math.abs(monthlyIncome - monthlyExpenses).toFixed(2)} more than you earn this month`,
        icon: AlertTriangle,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      message: 'Add more transactions and set budgets to get personalized spending insights',
      icon: Lightbulb,
    });
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-300">
          <Lightbulb className="h-5 w-5" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.slice(0, 4).map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/20">
              <div className={`p-1 rounded-full mt-0.5 ${
                insight.type === 'warning' ? 'bg-red-500/20' :
                insight.type === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'
              }`}>
                <insight.icon className={`h-3 w-3 ${
                  insight.type === 'warning' ? 'text-red-400' :
                  insight.type === 'success' ? 'text-green-400' : 'text-blue-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-100 leading-relaxed">{insight.message}</p>
                <Badge 
                  variant="outline" 
                  className={`mt-1 text-xs ${
                    insight.type === 'warning' ? 'border-red-500/30 text-red-300' :
                    insight.type === 'success' ? 'border-green-500/30 text-green-300' : 'border-blue-500/30 text-blue-300'
                  }`}
                >
                  {insight.type === 'warning' ? 'Alert' : insight.type === 'success' ? 'Good' : 'Info'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}