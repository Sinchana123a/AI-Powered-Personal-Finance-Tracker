'use client';

import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { getAIInsights } from '@/lib/ai-transactions';

interface AIInsightsProps {
  transactions: Transaction[];
}

export function AIInsights({ transactions }: AIInsightsProps) {
  const insights = getAIInsights(transactions);

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-300">
          <Brain className="h-5 w-5" />
          AI Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/20">
              <div className="p-1 rounded-full bg-purple-500/20 mt-0.5">
                <Lightbulb className="h-3 w-3 text-purple-400" />
              </div>
              <p className="text-sm text-purple-100 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}