'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle, 
  Brain, 
  Sparkles, 
  CheckCircle,
  FileSpreadsheet,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Transaction, Budget, FinancialGoal } from '@/types/transaction';
import { getTransactions } from '@/lib/transaction-storage';
import { getBudgets } from '@/lib/budget-storage';
import { getGoals } from '@/lib/goals-storage';
import { generateMultipleAITransactions } from '@/lib/ai-transactions';

interface AIExportImportProps {
  onImportTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
}

interface AITemplate {
  name: string;
  description: string;
  category: string;
  transactionCount: number;
  preview: string[];
}

const AI_CSV_TEMPLATES: AITemplate[] = [
  {
    name: 'Young Professional',
    description: 'Typical spending patterns for a young professional in their 20s-30s',
    category: 'lifestyle',
    transactionCount: 25,
    preview: [
      'Starbucks Coffee, $4.50, Food & Dining',
      'Uber Ride, $12.30, Transportation',
      'Netflix Subscription, $15.99, Entertainment'
    ]
  },
  {
    name: 'Family Budget',
    description: 'Family expenses including groceries, utilities, and childcare',
    category: 'family',
    transactionCount: 30,
    preview: [
      'Whole Foods Market, $125.67, Food & Dining',
      'Daycare Payment, $800.00, Education',
      'Electric Bill, $89.45, Bills & Utilities'
    ]
  },
  {
    name: 'Student Life',
    description: 'College student expenses with textbooks, food, and entertainment',
    category: 'student',
    transactionCount: 20,
    preview: [
      'Textbook Purchase, $89.99, Education',
      'Campus Cafeteria, $12.50, Food & Dining',
      'Movie Ticket, $14.00, Entertainment'
    ]
  },
  {
    name: 'Freelancer Portfolio',
    description: 'Freelancer income and business expenses',
    category: 'business',
    transactionCount: 35,
    preview: [
      'Client Payment, $1,250.00, Freelance',
      'Adobe Creative Suite, $52.99, Subscriptions',
      'Home Office Supplies, $67.89, Shopping'
    ]
  },
  {
    name: 'Retirement Planning',
    description: 'Senior-focused expenses with healthcare and leisure activities',
    category: 'senior',
    transactionCount: 22,
    preview: [
      'Medicare Premium, $144.60, Healthcare',
      'Pharmacy Prescription, $25.80, Healthcare',
      'Golf Club Membership, $89.00, Entertainment'
    ]
  }
];

export function AIExportImport({ onImportTransactions }: AIExportImportProps) {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'processing' | null;
    message: string;
    progress?: number;
  }>({ type: null, message: '' });
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisResults, setAnalysisResults] = useState<{
    duplicates: number;
    categorized: number;
    validated: number;
    suggestions: string[];
  } | null>(null);

  // AI-Enhanced Export Functions
  const exportWithAIAnalysis = () => {
    const transactions = getTransactions();
    const budgets = getBudgets();
    const goals = getGoals();
    
    // Add AI analysis to export
    const aiAnalysis = {
      exportDate: new Date().toISOString(),
      totalTransactions: transactions.length,
      spendingTrends: analyzeSpendingTrends(transactions),
      budgetPerformance: analyzeBudgetPerformance(transactions, budgets),
      goalProgress: analyzeGoalProgress(goals),
      recommendations: generateRecommendations(transactions, budgets)
    };
    
    const exportData = {
      transactions,
      budgets,
      goals,
      aiAnalysis,
      version: '2.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-finance-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSmartCSV = (category: string = 'all') => {
    const transactions = getTransactions();
    let filteredTransactions = transactions;
    
    if (category !== 'all') {
      filteredTransactions = transactions.filter(t => t.category === category);
    }
    
    if (filteredTransactions.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'No transactions to export for the selected category'
      });
      return;
    }

    // Enhanced CSV with AI insights
    const headers = [
      'Date', 'Description', 'Amount', 'Type', 'Category', 
      'AI_Confidence', 'Spending_Pattern', 'Anomaly_Score'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => {
        const aiInsights = generateTransactionInsights(t, transactions);
        return [
          t.date,
          `"${t.description}"`,
          t.amount,
          t.type,
          `"${t.category}"`,
          aiInsights.confidence,
          `"${aiInsights.pattern}"`,
          aiInsights.anomalyScore
        ].join(',');
      })
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-transactions-${category}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // AI Template Generation
  const generateAITemplate = async (templateName: string) => {
    setIsGenerating(true);
    setImportStatus({ type: 'processing', message: 'Generating AI template...', progress: 0 });
    
    const template = AI_CSV_TEMPLATES.find(t => t.name === templateName);
    if (!template) return;

    try {
      // Simulate AI processing with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setImportStatus({ 
          type: 'processing', 
          message: `Generating ${template.name} template...`, 
          progress: i 
        });
      }

      const transactions = generateTemplateTransactions(template);
      
      // Create CSV content
      const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          t.date,
          `"${t.description}"`,
          t.amount,
          t.type,
          `"${t.category}"`
        ].join(','))
      ].join('\n');

      // Download the generated template
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-template-${templateName.toLowerCase().replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setImportStatus({
        type: 'success',
        message: `Generated ${template.name} template with ${transactions.length} transactions`
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to generate AI template'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomTemplate = async () => {
    if (!customPrompt.trim()) {
      setImportStatus({
        type: 'error',
        message: 'Please enter a description for your custom template'
      });
      return;
    }

    setIsGenerating(true);
    setImportStatus({ type: 'processing', message: 'Processing your request...', progress: 0 });

    try {
      // Simulate AI processing
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setImportStatus({ 
          type: 'processing', 
          message: 'AI is creating your custom template...', 
          progress: i 
        });
      }

      const transactions = generateCustomTransactions(customPrompt);
      
      const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          t.date,
          `"${t.description}"`,
          t.amount,
          t.type,
          `"${t.category}"`
        ].join(','))
      ].join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `custom-ai-template-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setImportStatus({
        type: 'success',
        message: `Generated custom template with ${transactions.length} transactions based on your description`
      });
      setCustomPrompt('');
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to generate custom template'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced Import with AI Analysis
  const handleAIImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'processing', message: 'AI is analyzing your file...', progress: 0 });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        
        // Simulate AI processing with progress
        for (let i = 0; i <= 80; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setImportStatus({ 
            type: 'processing', 
            message: 'AI is processing and validating data...', 
            progress: i 
          });
        }
        
        if (file.name.endsWith('.csv')) {
          await processAICSV(content);
        } else if (file.name.endsWith('.json')) {
          await processAIJSON(content);
        } else {
          setImportStatus({
            type: 'error',
            message: 'Unsupported file format. Please use CSV or JSON files.'
          });
        }
      } catch (error) {
        setImportStatus({
          type: 'error',
          message: 'Failed to process file. Please check the file format.'
        });
      }
    };
    reader.readAsText(file);
  };

  const processAICSV = async (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const transactions: Omit<Transaction, 'id'>[] = [];
      let duplicates = 0;
      let categorized = 0;
      let validated = 0;
      const suggestions: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < 4) continue;
        
        const dateIndex = headers.findIndex(h => h.includes('date'));
        const descIndex = headers.findIndex(h => h.includes('description'));
        const amountIndex = headers.findIndex(h => h.includes('amount'));
        const typeIndex = headers.findIndex(h => h.includes('type'));
        const categoryIndex = headers.findIndex(h => h.includes('category'));
        
        const amount = parseFloat(values[amountIndex]);
        const type = values[typeIndex].toLowerCase();
        
        if (isNaN(amount) || (type !== 'income' && type !== 'expense')) {
          continue;
        }
        
        const transaction = {
          date: values[dateIndex],
          description: values[descIndex] || 'Imported transaction',
          amount,
          type: type as 'income' | 'expense',
          category: categoryIndex >= 0 ? values[categoryIndex] || 'Other' : 'Other'
        };

        // AI duplicate detection
        const existingTransactions = getTransactions();
        const isDuplicate = existingTransactions.some(existing => 
          existing.date === transaction.date &&
          existing.description === transaction.description &&
          Math.abs(existing.amount - transaction.amount) < 0.01
        );

        if (isDuplicate) {
          duplicates++;
          continue;
        }

        // AI categorization validation
        if (transaction.category === 'Other') {
          const suggestedCategory = suggestCategory(transaction.description);
          if (suggestedCategory !== 'Other') {
            transaction.category = suggestedCategory;
            categorized++;
          }
        }

        validated++;
        transactions.push(transaction);
      }
      
      // Generate AI suggestions
      if (duplicates > 0) {
        suggestions.push(`Detected and skipped ${duplicates} duplicate transactions`);
      }
      if (categorized > 0) {
        suggestions.push(`AI automatically categorized ${categorized} transactions`);
      }
      if (validated > transactions.length) {
        suggestions.push(`Validated and cleaned ${validated - transactions.length} problematic entries`);
      }

      setAnalysisResults({ duplicates, categorized, validated, suggestions });
      
      if (transactions.length > 0) {
        onImportTransactions(transactions);
        setImportStatus({
          type: 'success',
          message: `Successfully imported ${transactions.length} transactions with AI enhancements`
        });
      } else {
        setImportStatus({
          type: 'error',
          message: 'No valid transactions found after AI analysis'
        });
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to parse CSV file with AI analysis'
      });
    }
  };

  const processAIJSON = async (content: string) => {
    try {
      const data = JSON.parse(content);
      
      if (data.transactions && Array.isArray(data.transactions)) {
        const validTransactions = data.transactions.filter((t: any) => 
          t.amount && t.date && t.description && t.type && 
          (t.type === 'income' || t.type === 'expense')
        );
        
        // AI enhancement of imported data
        const enhancedTransactions = validTransactions.map((t: any) => ({
          ...t,
          category: t.category || suggestCategory(t.description)
        }));
        
        if (enhancedTransactions.length > 0) {
          onImportTransactions(enhancedTransactions);
          setImportStatus({
            type: 'success',
            message: `Successfully imported ${enhancedTransactions.length} transactions with AI categorization`
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'No valid transactions found in the JSON file'
          });
        }
      } else {
        setImportStatus({
          type: 'error',
          message: 'Invalid JSON format. Expected transactions array.'
        });
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to parse JSON file'
      });
    }
  };

  // Helper functions
  const analyzeSpendingTrends = (transactions: Transaction[]) => {
    const monthlySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const month = t.date.slice(0, 7);
        acc[month] = (acc[month] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(monthlySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  };

  const analyzeBudgetPerformance = (transactions: Transaction[], budgets: Budget[]) => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        performance: (spent / budget.amount) * 100
      };
    });
  };

  const analyzeGoalProgress = (goals: FinancialGoal[]) => {
    return goals.map(goal => ({
      title: goal.title,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      daysRemaining: Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));
  };

  const generateRecommendations = (transactions: Transaction[], budgets: Budget[]) => {
    const recommendations = [];
    
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      if (savingsRate < 20) {
        recommendations.push('Consider increasing your savings rate to at least 20%');
      }
    }
    
    return recommendations;
  };

  const generateTransactionInsights = (transaction: Transaction, allTransactions: Transaction[]) => {
    const categoryTransactions = allTransactions.filter(t => t.category === transaction.category);
    const avgAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length;
    
    return {
      confidence: Math.min(95, Math.max(60, categoryTransactions.length * 10)),
      pattern: transaction.amount > avgAmount * 1.5 ? 'High Spending' : transaction.amount < avgAmount * 0.5 ? 'Low Spending' : 'Normal',
      anomalyScore: Math.abs(transaction.amount - avgAmount) / avgAmount
    };
  };

  const generateTemplateTransactions = (template: AITemplate): Omit<Transaction, 'id'>[] => {
    // Use existing AI transaction generator with template-specific modifications
    const baseTransactions = generateMultipleAITransactions(template.transactionCount);
    
    // Customize based on template type
    return baseTransactions.map(t => {
      if (template.category === 'student') {
        // Adjust amounts for student budget
        return { ...t, amount: t.amount * 0.6 };
      } else if (template.category === 'family') {
        // Increase amounts for family expenses
        return { ...t, amount: t.amount * 1.4 };
      }
      return t;
    });
  };

  const generateCustomTransactions = (prompt: string): Omit<Transaction, 'id'>[] => {
    // Simple AI-like logic based on prompt keywords
    const keywords = prompt.toLowerCase();
    let multiplier = 1;
    let transactionCount = 20;
    
    if (keywords.includes('high income') || keywords.includes('wealthy')) {
      multiplier = 2.5;
    } else if (keywords.includes('budget') || keywords.includes('frugal')) {
      multiplier = 0.7;
    }
    
    if (keywords.includes('many') || keywords.includes('frequent')) {
      transactionCount = 35;
    } else if (keywords.includes('few') || keywords.includes('minimal')) {
      transactionCount = 12;
    }
    
    const transactions = generateMultipleAITransactions(transactionCount);
    return transactions.map(t => ({ ...t, amount: t.amount * multiplier }));
  };

  const suggestCategory = (description: string): string => {
    const desc = description.toLowerCase();
    
    if (desc.includes('coffee') || desc.includes('restaurant') || desc.includes('food')) {
      return 'Food & Dining';
    } else if (desc.includes('uber') || desc.includes('gas') || desc.includes('transport')) {
      return 'Transportation';
    } else if (desc.includes('netflix') || desc.includes('movie') || desc.includes('game')) {
      return 'Entertainment';
    } else if (desc.includes('electric') || desc.includes('water') || desc.includes('internet')) {
      return 'Bills & Utilities';
    }
    
    return 'Other';
  };

  return (
    <Card className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-300">
          <Brain className="h-5 w-5" />
          AI Export & Import Hub
        </CardTitle>
        <p className="text-sm text-violet-200/70">
          Advanced data management with AI-powered analysis and template generation
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-violet-950/30">
            <TabsTrigger value="export" className="data-[state=active]:bg-violet-600">
              <Download className="h-4 w-4 mr-1" />
              Smart Export
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-violet-600">
              <Sparkles className="h-4 w-4 mr-1" />
              AI Templates
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-violet-600">
              <Upload className="h-4 w-4 mr-1" />
              AI Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-violet-200">AI-Enhanced Export</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={exportWithAIAnalysis}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
                >
                  <Brain className="h-4 w-4" />
                  Export with AI Analysis
                </Button>
                <Button
                  onClick={() => exportSmartCSV()}
                  variant="outline"
                  className="flex items-center gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Smart CSV Export
                </Button>
              </div>
              <p className="text-xs text-violet-200/70">
                AI analysis includes spending trends, budget performance, and personalized recommendations
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-violet-200">Pre-built AI Templates</h3>
              <div className="grid gap-3">
                {AI_CSV_TEMPLATES.map((template) => (
                  <div
                    key={template.name}
                    className="p-3 rounded-lg bg-violet-950/30 border border-violet-500/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-violet-100">{template.name}</h4>
                        <p className="text-sm text-violet-200/70">{template.description}</p>
                      </div>
                      <Badge className="bg-violet-600 text-white">
                        {template.transactionCount} items
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-violet-300 mb-1">Preview:</p>
                      <div className="space-y-1">
                        {template.preview.map((item, index) => (
                          <p key={index} className="text-xs text-violet-200/60 font-mono">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => generateAITemplate(template.name)}
                      disabled={isGenerating}
                      size="sm"
                      className="w-full bg-violet-600 hover:bg-violet-700"
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Generate Template
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-violet-950/30 border border-violet-500/20">
                <h4 className="font-medium text-violet-100 mb-3">Custom AI Template</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="custom-prompt" className="text-violet-200">
                      Describe your ideal financial scenario
                    </Label>
                    <Textarea
                      id="custom-prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g., 'A tech professional with high income, frequent dining out, and investment focus'"
                      className="bg-violet-950/30 border-violet-500/30 text-violet-100 mt-1"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={generateCustomTemplate}
                    disabled={isGenerating || !customPrompt.trim()}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Generate Custom Template
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-violet-200">AI-Powered Import</h3>
              <div className="space-y-2">
                <Label htmlFor="ai-import-file" className="text-sm text-violet-200">
                  Select file for AI analysis
                </Label>
                <Input
                  id="ai-import-file"
                  type="file"
                  accept=".csv,.json"
                  onChange={handleAIImport}
                  className="bg-violet-950/30 border-violet-500/30 text-violet-100"
                />
              </div>
              
              {importStatus.type === 'processing' && (
                <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-violet-400 animate-spin" />
                    <p className="text-sm text-violet-200">{importStatus.message}</p>
                  </div>
                  {importStatus.progress !== undefined && (
                    <Progress value={importStatus.progress} className="h-2" />
                  )}
                </div>
              )}
              
              {importStatus.type && importStatus.type !== 'processing' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  importStatus.type === 'success' 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {importStatus.type === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                  <p className={`text-sm ${
                    importStatus.type === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {importStatus.message}
                  </p>
                </div>
              )}

              {analysisResults && (
                <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-500/20">
                  <h4 className="font-medium text-violet-100 mb-2">AI Analysis Results</h4>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-violet-300">{analysisResults.duplicates}</p>
                      <p className="text-xs text-violet-200/70">Duplicates Removed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-violet-300">{analysisResults.categorized}</p>
                      <p className="text-xs text-violet-200/70">Auto-Categorized</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-violet-300">{analysisResults.validated}</p>
                      <p className="text-xs text-violet-200/70">Validated</p>
                    </div>
                  </div>
                  {analysisResults.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs text-violet-200 mb-1">AI Suggestions:</p>
                      <ul className="space-y-1">
                        {analysisResults.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-xs text-violet-200/70 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-xs text-violet-200/70">AI Features:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="border-violet-500/30 text-violet-300 justify-center">
                    Duplicate Detection
                  </Badge>
                  <Badge variant="outline" className="border-violet-500/30 text-violet-300 justify-center">
                    Smart Categorization
                  </Badge>
                  <Badge variant="outline" className="border-violet-500/30 text-violet-300 justify-center">
                    Data Validation
                  </Badge>
                  <Badge variant="outline" className="border-violet-500/30 text-violet-300 justify-center">
                    Anomaly Detection
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}