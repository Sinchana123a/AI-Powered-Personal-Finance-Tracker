'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { Transaction, Budget, FinancialGoal } from '@/types/transaction';
import { getTransactions } from '@/lib/transaction-storage';
import { getBudgets } from '@/lib/budget-storage';
import { getGoals } from '@/lib/goals-storage';
import { Badge } from '@/components/ui/badge';

interface ExportImportProps {
  onImportTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
}

export function ExportImport({ onImportTransactions }: ExportImportProps) {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const exportData = () => {
    const transactions = getTransactions();
    const budgets = getBudgets();
    const goals = getGoals();
    
    const exportData = {
      transactions,
      budgets,
      goals,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const transactions = getTransactions();
    
    if (transactions.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'No transactions to export'
      });
      return;
    }

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
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          importCSV(content);
        } else if (file.name.endsWith('.json')) {
          importJSON(content);
        } else {
          setImportStatus({
            type: 'error',
            message: 'Unsupported file format. Please use CSV or JSON files.'
          });
        }
      } catch (error) {
        setImportStatus({
          type: 'error',
          message: 'Failed to read file. Please check the file format.'
        });
      }
    };
    reader.readAsText(file);
  };

  const importCSV = (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Check for required headers
      const requiredHeaders = ['date', 'description', 'amount', 'type'];
      const missingHeaders = requiredHeaders.filter(h => 
        !headers.some(header => header.includes(h))
      );
      
      if (missingHeaders.length > 0) {
        setImportStatus({
          type: 'error',
          message: `Missing required columns: ${missingHeaders.join(', ')}`
        });
        return;
      }

      const transactions: Omit<Transaction, 'id'>[] = [];
      
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
        
        transactions.push({
          date: values[dateIndex],
          description: values[descIndex] || 'Imported transaction',
          amount,
          type: type as 'income' | 'expense',
          category: categoryIndex >= 0 ? values[categoryIndex] || 'Other' : 'Other'
        });
      }
      
      if (transactions.length > 0) {
        onImportTransactions(transactions);
        setImportStatus({
          type: 'success',
          message: `Successfully imported ${transactions.length} transactions`
        });
      } else {
        setImportStatus({
          type: 'error',
          message: 'No valid transactions found in the file'
        });
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to parse CSV file. Please check the format.'
      });
    }
  };

  const importJSON = (content: string) => {
    try {
      const data = JSON.parse(content);
      
      if (data.transactions && Array.isArray(data.transactions)) {
        const validTransactions = data.transactions.filter((t: any) => 
          t.amount && t.date && t.description && t.type && 
          (t.type === 'income' || t.type === 'expense')
        );
        
        if (validTransactions.length > 0) {
          onImportTransactions(validTransactions);
          setImportStatus({
            type: 'success',
            message: `Successfully imported ${validTransactions.length} transactions`
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
        message: 'Failed to parse JSON file. Please check the format.'
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-300">
          <FileText className="h-5 w-5" />
          Export & Import Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-orange-200">Export Data</h3>
          <div className="flex gap-2">
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Button
              onClick={exportCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <p className="text-xs text-orange-200/70">
            JSON includes all data (transactions, budgets, goals). CSV includes transactions only.
          </p>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-orange-200">Import Data</h3>
          <div className="space-y-2">
            <Label htmlFor="import-file" className="text-sm text-orange-200">
              Select CSV or JSON file
            </Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv,.json"
              onChange={handleFileImport}
              className="bg-orange-950/30 border-orange-500/30 text-orange-100"
            />
          </div>
          
          {importStatus.type && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              importStatus.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {importStatus.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
              <p className={`text-sm ${
                importStatus.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>
                {importStatus.message}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-xs text-orange-200/70">Supported formats:</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                CSV: Date, Description, Amount, Type, Category
              </Badge>
              <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                JSON: Full data export format
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}