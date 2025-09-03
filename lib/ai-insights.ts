import { Transaction, Budget } from '@/types/transaction';

export interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'prediction';
  title: string;
  message: string;
  confidence: number;
  actionable: boolean;
  category?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

export interface AnomalyDetection {
  transaction: Transaction;
  anomalyType: 'unusual_amount' | 'unusual_frequency' | 'new_category' | 'timing_anomaly';
  severity: 'high' | 'medium' | 'low';
  explanation: string;
}

export class AIFinanceAnalyzer {
  private transactions: Transaction[];
  private budgets: Budget[];

  constructor(transactions: Transaction[], budgets: Budget[] = []) {
    this.transactions = transactions;
    this.budgets = budgets;
  }

  generateAdvancedInsights(): AIInsight[] {
    const insights: AIInsight[] = [];

    // Cash flow analysis
    insights.push(...this.analyzeCashFlow());
    
    // Spending pattern analysis
    insights.push(...this.analyzeSpendingPatterns());
    
    // Budget optimization
    insights.push(...this.analyzeBudgetOptimization());
    
    // Seasonal spending analysis
    insights.push(...this.analyzeSeasonalSpending());
    
    // Financial health score
    insights.push(...this.calculateFinancialHealthScore());

    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  }

  private analyzeCashFlow(): AIInsight[] {
    const insights: AIInsight[] = [];
    const monthlyData = this.getMonthlyData();
    
    if (monthlyData.length < 2) return insights;

    const latestMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    
    const cashFlowChange = latestMonth.netFlow - previousMonth.netFlow;
    const changePercentage = Math.abs(cashFlowChange / previousMonth.netFlow) * 100;

    if (changePercentage > 20) {
      insights.push({
        id: 'cashflow-change',
        type: cashFlowChange > 0 ? 'success' : 'warning',
        title: 'Significant Cash Flow Change',
        message: `Your cash flow ${cashFlowChange > 0 ? 'improved' : 'declined'} by ${changePercentage.toFixed(1)}% this month (${cashFlowChange > 0 ? '+' : ''}$${cashFlowChange.toFixed(2)})`,
        confidence: 0.9,
        actionable: cashFlowChange < 0,
        impact: changePercentage > 50 ? 'high' : 'medium'
      });
    }

    return insights;
  }

  private analyzeSpendingPatterns(): AIInsight[] {
    const insights: AIInsight[] = [];
    const categorySpending = this.getCategorySpending();
    
    // Find dominant spending category
    const topCategory = categorySpending[0];
    if (topCategory && topCategory.percentage > 40) {
      insights.push({
        id: 'dominant-category',
        type: 'info',
        title: 'Spending Concentration Alert',
        message: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your spending. Consider diversifying your expenses.`,
        confidence: 0.85,
        actionable: true,
        category: topCategory.category,
        impact: 'medium'
      });
    }

    // Detect unusual spending spikes
    const weeklySpending = this.getWeeklySpending();
    if (weeklySpending.length >= 4) {
      const avgWeeklySpending = weeklySpending.slice(0, -1).reduce((sum, week) => sum + week.amount, 0) / (weeklySpending.length - 1);
      const currentWeekSpending = weeklySpending[weeklySpending.length - 1].amount;
      
      if (currentWeekSpending > avgWeeklySpending * 1.5) {
        insights.push({
          id: 'spending-spike',
          type: 'warning',
          title: 'Unusual Spending Spike Detected',
          message: `This week's spending ($${currentWeekSpending.toFixed(2)}) is ${((currentWeekSpending / avgWeeklySpending - 1) * 100).toFixed(1)}% higher than your average.`,
          confidence: 0.8,
          actionable: true,
          impact: 'high'
        });
      }
    }

    return insights;
  }

  private analyzeBudgetOptimization(): AIInsight[] {
    const insights: AIInsight[] = [];
    
    if (this.budgets.length === 0) {
      insights.push({
        id: 'no-budgets',
        type: 'info',
        title: 'Budget Optimization Opportunity',
        message: 'Setting up budgets could help you save an estimated 15-20% on monthly expenses based on your spending patterns.',
        confidence: 0.7,
        actionable: true,
        impact: 'high'
      });
      return insights;
    }

    // Analyze budget efficiency
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTransactions = this.transactions.filter(t => t.date.startsWith(currentMonth));
    
    this.budgets.forEach(budget => {
      const spent = monthlyTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const utilization = spent / budget.amount;
      
      if (utilization < 0.5) {
        insights.push({
          id: `underutilized-budget-${budget.category}`,
          type: 'success',
          title: 'Budget Optimization Opportunity',
          message: `You're only using ${(utilization * 100).toFixed(1)}% of your ${budget.category} budget. Consider reallocating $${(budget.amount - spent).toFixed(2)} to other categories.`,
          confidence: 0.75,
          actionable: true,
          category: budget.category,
          impact: 'medium'
        });
      }
    });

    return insights;
  }

  private analyzeSeasonalSpending(): AIInsight[] {
    const insights: AIInsight[] = [];
    const monthlySpending = this.getMonthlySpendingByCategory();
    
    if (monthlySpending.length < 6) return insights;

    // Detect seasonal patterns
    const currentMonth = new Date().getMonth();
    const seasonalCategories = ['Entertainment', 'Travel', 'Shopping'];
    
    seasonalCategories.forEach(category => {
      const categoryData = monthlySpending.filter(m => m.categories[category]);
      if (categoryData.length >= 3) {
        const avgSpending = categoryData.reduce((sum, m) => sum + (m.categories[category] || 0), 0) / categoryData.length;
        const recentSpending = categoryData[categoryData.length - 1].categories[category] || 0;
        
        if (recentSpending > avgSpending * 1.3) {
          insights.push({
            id: `seasonal-${category}`,
            type: 'info',
            title: 'Seasonal Spending Pattern',
            message: `Your ${category} spending is ${((recentSpending / avgSpending - 1) * 100).toFixed(1)}% higher than usual. This might be seasonal.`,
            confidence: 0.65,
            actionable: false,
            category,
            impact: 'low'
          });
        }
      }
    });

    return insights;
  }

  private calculateFinancialHealthScore(): AIInsight[] {
    const insights: AIInsight[] = [];
    
    const totalIncome = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    if (totalIncome === 0) return insights;
    
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    const expenseRatio = (totalExpenses / totalIncome) * 100;
    
    let healthScore = 0;
    let healthMessage = '';
    let healthType: 'success' | 'warning' | 'info' = 'info';
    
    if (savingsRate >= 20) {
      healthScore = 90 + Math.min(savingsRate - 20, 10);
      healthMessage = `Excellent financial health! You're saving ${savingsRate.toFixed(1)}% of your income.`;
      healthType = 'success';
    } else if (savingsRate >= 10) {
      healthScore = 70 + (savingsRate - 10);
      healthMessage = `Good financial health. Consider increasing your savings rate from ${savingsRate.toFixed(1)}% to 20%.`;
      healthType = 'info';
    } else if (savingsRate >= 0) {
      healthScore = 50 + savingsRate;
      healthMessage = `Your savings rate is ${savingsRate.toFixed(1)}%. Focus on reducing expenses or increasing income.`;
      healthType = 'warning';
    } else {
      healthScore = Math.max(0, 50 + savingsRate);
      healthMessage = `You're spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn. Immediate action needed.`;
      healthType = 'warning';
    }
    
    insights.push({
      id: 'financial-health',
      type: healthType,
      title: `Financial Health Score: ${healthScore.toFixed(0)}/100`,
      message: healthMessage,
      confidence: 0.95,
      actionable: healthScore < 80,
      impact: healthScore < 60 ? 'high' : healthScore < 80 ? 'medium' : 'low'
    });

    return insights;
  }

  predictNextMonthSpending(): SpendingPrediction[] {
    const predictions: SpendingPrediction[] = [];
    const monthlyData = this.getMonthlySpendingByCategory();
    
    if (monthlyData.length < 3) return predictions;

    const categories = new Set<string>();
    monthlyData.forEach(month => {
      Object.keys(month.categories).forEach(cat => categories.add(cat));
    });

    categories.forEach(category => {
      const categoryData = monthlyData.map(m => m.categories[category] || 0);
      const trend = this.calculateTrend(categoryData);
      const avgSpending = categoryData.reduce((sum, val) => sum + val, 0) / categoryData.length;
      
      let predictedAmount = avgSpending;
      let confidence = 0.6;
      
      if (trend.slope !== 0) {
        predictedAmount = avgSpending + (trend.slope * monthlyData.length);
        confidence = Math.min(0.9, 0.6 + Math.abs(trend.correlation) * 0.3);
      }
      
      predictions.push({
        category,
        predictedAmount: Math.max(0, predictedAmount),
        confidence,
        trend: trend.slope > 0.1 ? 'increasing' : trend.slope < -0.1 ? 'decreasing' : 'stable',
        recommendation: this.generateRecommendation(category, trend.slope, avgSpending)
      });
    });

    return predictions.sort((a, b) => b.predictedAmount - a.predictedAmount).slice(0, 6);
  }

  detectAnomalies(): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const recentTransactions = this.transactions.slice(-30); // Last 30 transactions
    
    recentTransactions.forEach(transaction => {
      // Check for unusual amounts
      const categoryTransactions = this.transactions.filter(t => 
        t.category === transaction.category && t.type === transaction.type
      );
      
      if (categoryTransactions.length >= 5) {
        const amounts = categoryTransactions.map(t => t.amount);
        const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length);
        
        if (Math.abs(transaction.amount - avg) > 2 * stdDev) {
          anomalies.push({
            transaction,
            anomalyType: 'unusual_amount',
            severity: Math.abs(transaction.amount - avg) > 3 * stdDev ? 'high' : 'medium',
            explanation: `This ${transaction.type} of $${transaction.amount} is ${transaction.amount > avg ? 'significantly higher' : 'significantly lower'} than your usual ${transaction.category} spending (avg: $${avg.toFixed(2)})`
          });
        }
      }
    });

    return anomalies.slice(0, 5);
  }

  private getMonthlyData() {
    const monthlyData: { [key: string]: { income: number; expenses: number; netFlow: number } } = {};
    
    this.transactions.forEach(transaction => {
      const monthKey = transaction.date.slice(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, netFlow: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
      monthlyData[monthKey].netFlow = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }

  private getCategorySpending() {
    const categoryTotals: { [key: string]: number } = {};
    const totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        return sum + t.amount;
      }, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private getWeeklySpending() {
    const weeklyData: { [key: string]: number } = {};
    
    this.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().slice(0, 10);
        
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + transaction.amount;
      });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, amount]) => ({ week, amount }));
  }

  private getMonthlySpendingByCategory() {
    const monthlyData: { [key: string]: { [category: string]: number } } = {};
    
    this.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const monthKey = transaction.date.slice(0, 7);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {};
        }
        monthlyData[monthKey][transaction.category] = (monthlyData[monthKey][transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, categories]) => ({ month, categories }));
  }

  private calculateTrend(data: number[]) {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * data[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = x.reduce((sum, val, i) => sum + (val - meanX) * (data[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0));
    const denomY = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0));
    const correlation = numerator / (denomX * denomY);
    
    return { slope, intercept, correlation };
  }

  private generateRecommendation(category: string, slope: number, avgSpending: number): string {
    if (slope > 0.1) {
      return `Your ${category} spending is trending upward. Consider setting a budget limit of $${(avgSpending * 1.1).toFixed(2)} to control growth.`;
    } else if (slope < -0.1) {
      return `Great job reducing ${category} spending! You could potentially reallocate some of this budget to savings or other priorities.`;
    } else {
      return `Your ${category} spending is stable at around $${avgSpending.toFixed(2)} per month. This consistency is good for budgeting.`;
    }
  }
}