'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, RefreshCw, Zap } from 'lucide-react';
import { generateMultipleAITransactions } from '@/lib/ai-transactions';
import { Transaction } from '@/types/transaction';

interface AITransactionGeneratorProps {
  onAddTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
}

export function AITransactionGenerator({ onAddTransactions }: AITransactionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState<Omit<Transaction, 'id'>[]>([]);

  const generatePreview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const transactions = generateMultipleAITransactions(5);
      setPreviewTransactions(transactions);
      setIsGenerating(false);
    }, 800); // Simulate AI processing time
  };

  const addAllTransactions = () => {
    onAddTransactions(previewTransactions);
    setPreviewTransactions([]);
  };

  const addSingleTransaction = (transaction: Omit<Transaction, 'id'>) => {
    onAddTransactions([transaction]);
    setPreviewTransactions(prev => prev.filter(t => t !== transaction));
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-300">
          <Sparkles className="h-5 w-5" />
          AI Transaction Generator
        </CardTitle>
        <p className="text-sm text-emerald-200/70">
          Generate realistic transactions based on common spending patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={generatePreview}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Sample Data'}
          </Button>
          
          {previewTransactions.length > 0 && (
            <Button
              onClick={addAllTransactions}
              variant="outline"
              className="flex items-center gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4" />
              Add All ({previewTransactions.length})
            </Button>
          )}
        </div>

        {previewTransactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-emerald-300 mb-3">Generated Transactions:</h4>
            {previewTransactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={transaction.type === 'income' ? 'default' : 'secondary'}
                    className={transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {transaction.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-emerald-100">{transaction.description}</p>
                    <p className="text-xs text-emerald-300/70">{transaction.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addSingleTransaction(transaction)}
                    className="h-8 w-8 p-0 hover:bg-emerald-500/20"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}