'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, X, Brain } from 'lucide-react';

interface SmartCategorizationProps {
  transactions: Transaction[];
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

interface CategorySuggestion {
  transactionId: string;
  currentCategory: string;
  suggestedCategory: string;
  confidence: number;
  reason: string;
}

export function SmartCategorization({ transactions, onUpdateTransaction }: SmartCategorizationProps) {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTransactions = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newSuggestions = generateCategorySuggestions(transactions);
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 1000);
  };

  useEffect(() => {
    if (transactions.length > 0) {
      analyzeTransactions();
    }
  }, [transactions]);

  const generateCategorySuggestions = (transactions: Transaction[]): CategorySuggestion[] => {
    const suggestions: CategorySuggestion[] = [];
    
    // AI-like categorization rules based on description patterns
    const categoryRules = {
      'Food & Dining': [
        { keywords: ['starbucks', 'coffee', 'cafe', 'restaurant', 'pizza', 'burger', 'food', 'dining', 'lunch', 'dinner', 'breakfast'], confidence: 0.9 },
        { keywords: ['grocery', 'supermarket', 'market', 'whole foods', 'trader', 'safeway', 'costco'], confidence: 0.85 }
      ],
      'Transportation': [
        { keywords: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'transit', 'bus', 'train'], confidence: 0.9 },
        { keywords: ['car', 'auto', 'vehicle', 'maintenance', 'repair'], confidence: 0.8 }
      ],
      'Entertainment': [
        { keywords: ['netflix', 'spotify', 'movie', 'theater', 'cinema', 'game', 'gaming', 'entertainment'], confidence: 0.9 },
        { keywords: ['concert', 'show', 'event', 'ticket'], confidence: 0.85 }
      ],
      'Bills & Utilities': [
        { keywords: ['electric', 'electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'utility', 'bill'], confidence: 0.95 },
        { keywords: ['insurance', 'rent', 'mortgage'], confidence: 0.9 }
      ],
      'Shopping': [
        { keywords: ['amazon', 'store', 'shop', 'retail', 'purchase', 'buy'], confidence: 0.7 },
        { keywords: ['clothing', 'clothes', 'fashion', 'shoes'], confidence: 0.8 }
      ],
      'Healthcare': [
        { keywords: ['doctor', 'hospital', 'medical', 'pharmacy', 'health', 'clinic', 'dentist'], confidence: 0.9 }
      ],
      'Subscriptions': [
        { keywords: ['subscription', 'monthly', 'premium', 'pro', 'plus'], confidence: 0.8 }
      ]
    };

    transactions.forEach(transaction => {
      const description = transaction.description.toLowerCase();
      let bestMatch: { category: string; confidence: number; reason: string } | null = null;

      Object.entries(categoryRules).forEach(([category, rules]) => {
        rules.forEach(rule => {
          const matchedKeywords = rule.keywords.filter(keyword => 
            description.includes(keyword.toLowerCase())
          );
          
          if (matchedKeywords.length > 0 && category !== transaction.category) {
            const confidence = rule.confidence * (matchedKeywords.length / rule.keywords.length);
            
            if (!bestMatch || confidence > bestMatch.confidence) {
              bestMatch = {
                category,
                confidence,
                reason: `Detected keywords: ${matchedKeywords.join(', ')}`
              };
            }
          }
        });
      });

      if (bestMatch !== null) {
        const confirmedBestMatch = bestMatch;
        if (confirmedBestMatch.confidence > 0.7) {
        suggestions.push({
          transactionId: transaction.id,
          currentCategory: transaction.category,
          suggestedCategory: confirmedBestMatch.category,
          confidence: confirmedBestMatch.confidence,
          reason: confirmedBestMatch.reason
        });
        }
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const applySuggestion = (suggestion: CategorySuggestion) => {
    onUpdateTransaction(suggestion.transactionId, {
      category: suggestion.suggestedCategory
    });
    setSuggestions(prev => prev.filter(s => s.transactionId !== suggestion.transactionId));
  };

  const dismissSuggestion = (transactionId: string) => {
    setSuggestions(prev => prev.filter(s => s.transactionId !== transactionId));
  };

  if (suggestions.length === 0 && !isAnalyzing) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/20">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Brain className="h-8 w-8 text-emerald-400 mb-2" />
          <p className="text-sm text-emerald-200">All transactions are properly categorized!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-300">
          <Sparkles className="h-5 w-5" />
          Smart Categorization
        </CardTitle>
        <p className="text-sm text-emerald-200/70">
          AI suggestions to improve your transaction categories
        </p>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 animate-pulse">
                <div className="h-4 bg-emerald-500/20 rounded mb-2"></div>
                <div className="h-3 bg-emerald-500/10 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const transaction = transactions.find(t => t.id === suggestion.transactionId);
              if (!transaction) return null;

              return (
                <div
                  key={suggestion.transactionId}
                  className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-emerald-100 mb-1">
                        {transaction.description}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-red-500/30 text-red-300">
                          {suggestion.currentCategory}
                        </Badge>
                        <span className="text-emerald-300">→</span>
                        <Badge variant="outline" className="border-green-500/30 text-green-300">
                          {suggestion.suggestedCategory}
                        </Badge>
                        <Badge className="bg-emerald-600 text-white text-xs">
                          {(suggestion.confidence * 100).toFixed(0)}% confident
                        </Badge>
                      </div>
                      <p className="text-xs text-emerald-300/70">{suggestion.reason}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => applySuggestion(suggestion)}
                        className="h-8 w-8 p-0 hover:bg-green-500/20 hover:text-green-400"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissSuggestion(suggestion.transactionId)}
                        className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}