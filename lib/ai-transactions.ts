import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

// AI-generated transaction patterns based on realistic spending habits
const AI_TRANSACTION_TEMPLATES = {
  groceries: [
    { description: 'Whole Foods Market', amount: [45, 120], type: 'expense' as const, category: 'Food & Dining' },
    { description: 'Trader Joe\'s', amount: [35, 85], type: 'expense' as const, category: 'Food & Dining' },
    { description: 'Safeway Grocery', amount: [55, 140], type: 'expense' as const, category: 'Food & Dining' },
    { description: 'Costco Wholesale', amount: [180, 350], type: 'expense' as const, category: 'Food & Dining' },
  ],
  dining: [
    { description: 'Starbucks Coffee', amount: [8, 25], type: 'expense' as const, category: 'Food & Dining' },
    { description: 'McDonald\'s', amount: [12, 28], type: 'expense' as const, category: 'Food & Dining' },
    { description: 'Chipotle Mexican Grill', amount: [15, 35], type: 'expense' as const, category: 'Food & Dining' },
    { description: 'Local Restaurant', amount: [45, 120], type: 'expense' as const, category: 'Food & Dining' },
    { description: 'Pizza Delivery', amount: [25, 55], type: 'expense' as const, category: 'Food & Dining' },
  ],
  transportation: [
    { description: 'Uber Ride', amount: [12, 45], type: 'expense' as const, category: 'Transportation' },
    { description: 'Gas Station Fill-up', amount: [35, 75], type: 'expense' as const, category: 'Transportation' },
    { description: 'Metro Transit Pass', amount: [25, 120], type: 'expense' as const, category: 'Transportation' },
    { description: 'Parking Fee', amount: [5, 25], type: 'expense' as const, category: 'Transportation' },
  ],
  utilities: [
    { description: 'Electric Bill', amount: [85, 180], type: 'expense' as const, category: 'Bills & Utilities' },
    { description: 'Internet Service', amount: [65, 120], type: 'expense' as const, category: 'Bills & Utilities' },
    { description: 'Water & Sewer', amount: [45, 95], type: 'expense' as const, category: 'Bills & Utilities' },
    { description: 'Phone Bill', amount: [55, 110], type: 'expense' as const, category: 'Bills & Utilities' },
  ],
  entertainment: [
    { description: 'Netflix Subscription', amount: [15, 20], type: 'expense' as const, category: 'Entertainment' },
    { description: 'Movie Theater', amount: [15, 45], type: 'expense' as const, category: 'Entertainment' },
    { description: 'Spotify Premium', amount: [10, 15], type: 'expense' as const, category: 'Entertainment' },
    { description: 'Gaming Purchase', amount: [20, 80], type: 'expense' as const, category: 'Entertainment' },
  ],
  income: [
    { description: 'Salary Deposit', amount: [2500, 6500], type: 'income' as const, category: 'Salary' },
    { description: 'Freelance Payment', amount: [350, 1200], type: 'income' as const, category: 'Freelance' },
    { description: 'Investment Dividend', amount: [45, 250], type: 'income' as const, category: 'Investment' },
    { description: 'Side Hustle Income', amount: [150, 800], type: 'income' as const, category: 'Business' },
    { description: 'Tax Refund', amount: [450, 1500], type: 'income' as const, category: 'Other' },
  ],
};

function getRandomAmount(range: number[]): number {
  const [min, max] = range;
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getRandomDate(daysBack: number = 90): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split('T')[0];
}

function getRandomTemplate(): { description: string; amount: number; type: 'income' | 'expense'; category: string } {
  const categories = Object.keys(AI_TRANSACTION_TEMPLATES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const templates = AI_TRANSACTION_TEMPLATES[randomCategory as keyof typeof AI_TRANSACTION_TEMPLATES];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    description: template.description,
    amount: getRandomAmount(template.amount),
    type: template.type,
    category: template.category,
  };
}

export function generateAITransaction(): Omit<Transaction, 'id'> {
  const template = getRandomTemplate();
  
  return {
    amount: template.amount,
    date: getRandomDate(),
    description: template.description,
    type: template.type,
  };
}

export function generateMultipleAITransactions(count: number = 5): Omit<Transaction, 'id'>[] {
  const transactions: Omit<Transaction, 'id'>[] = [];
  const usedDescriptions = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let transaction = generateAITransaction();
    
    // Ensure unique descriptions in the batch
    while (usedDescriptions.has(transaction.description)) {
      transaction = generateAITransaction();
    }
    
    usedDescriptions.add(transaction.description);
    transactions.push(transaction);
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAIInsights(transactions: Transaction[]): string[] {
  const insights: string[] = [];
  
  if (transactions.length === 0) {
    return ['Start adding transactions to get AI-powered insights about your spending patterns.'];
  }
  
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  // Balance insights
  if (balance > 0) {
    insights.push(`💰 Great job! You're saving $${balance.toFixed(2)} this period.`);
  } else if (balance < 0) {
    insights.push(`⚠️ You're spending $${Math.abs(balance).toFixed(2)} more than you earn.`);
  }
  
  // Spending pattern insights
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  if (expenseTransactions.length > 0) {
    const avgExpense = totalExpenses / expenseTransactions.length;
    if (avgExpense > 100) {
      insights.push(`📊 Your average transaction is $${avgExpense.toFixed(2)} - consider tracking smaller expenses too.`);
    }
    
    // Find most expensive transaction
    const maxExpense = Math.max(...expenseTransactions.map(t => t.amount));
    const expensiveTransaction = expenseTransactions.find(t => t.amount === maxExpense);
    if (expensiveTransaction && maxExpense > 200) {
      insights.push(`🎯 Your largest expense was $${maxExpense.toFixed(2)} for ${expensiveTransaction.description}.`);
    }
  }
  
  // Frequency insights
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactionDate >= weekAgo;
  });
  
  if (recentTransactions.length > 10) {
    insights.push(`📈 You've been quite active with ${recentTransactions.length} transactions this week.`);
  } else if (recentTransactions.length < 3) {
    insights.push(`📉 Only ${recentTransactions.length} transactions this week - staying disciplined!`);
  }
  
  return insights.slice(0, 3); // Return top 3 insights
}