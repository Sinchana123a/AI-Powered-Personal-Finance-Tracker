'use client';

import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getTotalExpenses, getTotalIncome } from '@/lib/chart-data';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const balance = totalIncome - totalExpenses;
  const transactionCount = transactions.length;

  const cards = [
    {
      title: 'Total Balance',
      value: balance,
      icon: DollarSign,
      color: balance >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: balance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20',
    },
    {
      title: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      title: 'Transactions',
      value: transactionCount,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="transition-all hover:shadow-lg hover:shadow-primary/20 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.isCount ? card.value : `$${card.value.toFixed(2)}`}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor} border border-current/20`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}