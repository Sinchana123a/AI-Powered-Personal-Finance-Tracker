'use client';

import { Transaction, Budget } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, Shield, Target, AlertCircle } from 'lucide-react';

interface FinancialHealthScoreProps {
  transactions: Transaction[];
  budgets: Budget[];
}

interface HealthMetric {
  name: string;
  score: number;
  weight: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function FinancialHealthScore({ transactions, budgets }: FinancialHealthScoreProps) {
  const calculateHealthMetrics = (): HealthMetric[] => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Savings Rate (30% weight)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const savingsScore = Math.min(100, Math.max(0, savingsRate * 5)); // 20% savings = 100 score
    const savingsStatus = savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : savingsRate >= 5 ? 'fair' : 'poor';

    // Budget Adherence (25% weight)
    let budgetScore = 50; // Default if no budgets
    let budgetStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    
    if (budgets.length > 0) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
      
      let totalBudgetUtilization = 0;
      let budgetCount = 0;
      
      budgets.forEach(budget => {
        const spent = monthlyTransactions
          .filter(t => t.type === 'expense' && t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const utilization = spent / budget.amount;
        totalBudgetUtilization += utilization;
        budgetCount++;
      });
      
      const avgUtilization = totalBudgetUtilization / budgetCount;
      budgetScore = Math.max(0, 100 - (Math.max(0, avgUtilization - 0.8) * 500)); // Penalty for going over 80%
      budgetStatus = avgUtilization <= 0.8 ? 'excellent' : avgUtilization <= 0.9 ? 'good' : avgUtilization <= 1.0 ? 'fair' : 'poor';
    }

    // Expense Diversity (20% weight)
    const categoryCount = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category)).size;
    const diversityScore = Math.min(100, categoryCount * 12.5); // 8 categories = 100 score
    const diversityStatus = categoryCount >= 6 ? 'excellent' : categoryCount >= 4 ? 'good' : categoryCount >= 2 ? 'fair' : 'poor';

    // Transaction Consistency (15% weight)
    const last30Days = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= thirtyDaysAgo;
    });
    
    const consistencyScore = Math.min(100, last30Days.length * 5); // 20 transactions = 100 score
    const consistencyStatus = last30Days.length >= 15 ? 'excellent' : last30Days.length >= 10 ? 'good' : last30Days.length >= 5 ? 'fair' : 'poor';

    // Emergency Fund Indicator (10% weight)
    const monthlyExpenses = totalExpenses / Math.max(1, new Set(transactions.filter(t => t.type === 'expense').map(t => t.date.slice(0, 7))).size);
    const currentBalance = totalIncome - totalExpenses;
    const emergencyFundMonths = monthlyExpenses > 0 ? currentBalance / monthlyExpenses : 0;
    const emergencyScore = Math.min(100, emergencyFundMonths * 16.67); // 6 months = 100 score
    const emergencyStatus = emergencyFundMonths >= 6 ? 'excellent' : emergencyFundMonths >= 3 ? 'good' : emergencyFundMonths >= 1 ? 'fair' : 'poor';

    return [
      {
        name: 'Savings Rate',
        score: savingsScore,
        weight: 0.3,
        status: savingsStatus,
        description: `${savingsRate.toFixed(1)}% of income saved`,
        icon: TrendingUp
      },
      {
        name: 'Budget Adherence',
        score: budgetScore,
        weight: 0.25,
        status: budgetStatus,
        description: budgets.length > 0 ? 'Staying within budget limits' : 'No budgets set',
        icon: Target
      },
      {
        name: 'Expense Diversity',
        score: diversityScore,
        weight: 0.2,
        status: diversityStatus,
        description: `${categoryCount} spending categories`,
        icon: Shield
      },
      {
        name: 'Transaction Activity',
        score: consistencyScore,
        weight: 0.15,
        status: consistencyStatus,
        description: `${last30Days.length} transactions in 30 days`,
        icon: Heart
      },
      {
        name: 'Emergency Fund',
        score: emergencyScore,
        weight: 0.1,
        status: emergencyStatus,
        description: `${emergencyFundMonths.toFixed(1)} months of expenses`,
        icon: AlertCircle
      }
    ];
  };

  const metrics = calculateHealthMetrics();
  const overallScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-600';
      case 'good': return 'bg-blue-600';
      case 'fair': return 'bg-yellow-600';
      case 'poor': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent financial health! Keep up the great work.';
    if (score >= 75) return 'Good financial health with room for improvement.';
    if (score >= 60) return 'Fair financial health. Focus on key areas.';
    if (score >= 40) return 'Below average. Consider reviewing your finances.';
    return 'Poor financial health. Immediate attention needed.';
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 border-pink-500/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-pink-400 mb-4" />
          <h3 className="text-lg font-semibold text-pink-200 mb-2">Health Score Unavailable</h3>
          <p className="text-sm text-pink-300/70">Add transactions to calculate your financial health score.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 border-pink-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-300">
          <Heart className="h-5 w-5" />
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
            {overallScore.toFixed(0)}/100
          </div>
          <p className="text-sm text-pink-200/80">{getScoreDescription(overallScore)}</p>
          <Progress value={overallScore} className="h-3 mt-3" />
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="p-3 rounded-lg bg-pink-950/30 border border-pink-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <metric.icon className="h-4 w-4 text-pink-300" />
                  <span className="font-medium text-pink-100">{metric.name}</span>
                  <Badge className={`${getStatusColor(metric.status)} text-white text-xs`}>
                    {metric.status}
                  </Badge>
                </div>
                <span className={`font-semibold ${getScoreColor(metric.score)}`}>
                  {metric.score.toFixed(0)}
                </span>
              </div>
              <p className="text-sm text-pink-200/70 mb-2">{metric.description}</p>
              <Progress value={metric.score} className="h-1" />
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-3 rounded-lg bg-pink-950/30 border border-pink-500/20">
          <h4 className="font-semibold text-pink-200 mb-2">Recommendations</h4>
          <ul className="text-sm text-pink-200/80 space-y-1">
            {overallScore < 60 && (
              <li>• Focus on increasing your savings rate to at least 10%</li>
            )}
            {budgets.length === 0 && (
              <li>• Set up monthly budgets to better control spending</li>
            )}
            {metrics[2].score < 60 && (
              <li>• Diversify your spending across more categories</li>
            )}
            {metrics[4].score < 60 && (
              <li>• Build an emergency fund covering 3-6 months of expenses</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}