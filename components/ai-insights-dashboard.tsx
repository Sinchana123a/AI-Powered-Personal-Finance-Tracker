'use client';

import { useState, useEffect } from 'react';
import { Transaction, Budget } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap,
  Target,
  Shield,
  Lightbulb,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { AIFinanceAnalyzer, AIInsight, SpendingPrediction, AnomalyDetection } from '@/lib/ai-insights';

interface AIInsightsDashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function AIInsightsDashboard({ transactions, budgets }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeData = () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const analyzer = new AIFinanceAnalyzer(transactions, budgets);
      setInsights(analyzer.generateAdvancedInsights());
      setPredictions(analyzer.predictNextMonthSpending());
      setAnomalies(analyzer.detectAnomalies());
      setIsAnalyzing(false);
    }, 1500);
  };

  useEffect(() => {
    if (transactions.length > 0) {
      analyzeData();
    }
  }, [transactions, budgets]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'prediction': return TrendingUp;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'prediction': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    }
  };

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-12 w-12 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-purple-200 mb-2">AI Analysis Unavailable</h3>
          <p className="text-sm text-purple-300/70">Add transactions to unlock AI-powered insights and predictions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Brain className="h-5 w-5" />
            AI Financial Intelligence
          </CardTitle>
          <Button
            onClick={analyzeData}
            disabled={isAnalyzing}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Zap className="h-4 w-4 mr-1" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-purple-950/30">
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
              <Lightbulb className="h-4 w-4 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-1" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="data-[state=active]:bg-purple-600">
              <Shield className="h-4 w-4 mr-1" />
              Anomalies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4 mt-4">
            {isAnalyzing ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/20 animate-pulse">
                    <div className="h-4 bg-purple-500/20 rounded mb-2"></div>
                    <div className="h-3 bg-purple-500/10 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200">No insights available yet</p>
                <p className="text-sm text-purple-300/70">Add more transactions for better analysis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => {
                  const IconComponent = getInsightIcon(insight.type);
                  return (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full mt-0.5">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                insight.impact === 'high' ? 'border-red-500/30 text-red-300' :
                                insight.impact === 'medium' ? 'border-yellow-500/30 text-yellow-300' :
                                'border-green-500/30 text-green-300'
                              }`}
                            >
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm leading-relaxed mb-2">{insight.message}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-70">Confidence:</span>
                            <Progress value={insight.confidence * 100} className="h-1 w-20" />
                            <span className="text-xs opacity-70">{(insight.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4 mt-4">
            {isAnalyzing ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/20 animate-pulse">
                    <div className="h-4 bg-purple-500/20 rounded mb-2"></div>
                    <div className="h-3 bg-purple-500/10 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200">No predictions available</p>
                <p className="text-sm text-purple-300/70">Need more historical data for predictions</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2">Next Month Spending Predictions</h3>
                  <p className="text-sm text-purple-300/70">AI-powered forecasts based on your spending patterns</p>
                </div>
                {predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-purple-100">{prediction.category}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            prediction.trend === 'increasing' ? 'border-red-500/30 text-red-300' :
                            prediction.trend === 'decreasing' ? 'border-green-500/30 text-green-300' :
                            'border-blue-500/30 text-blue-300'
                          }`}
                        >
                          {prediction.trend}
                        </Badge>
                      </div>
                      <span className="font-bold text-purple-200">
                        ${prediction.predictedAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-purple-300/80 mb-2">{prediction.recommendation}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-400">Confidence:</span>
                      <Progress value={prediction.confidence * 100} className="h-1 w-20" />
                      <span className="text-xs text-purple-400">{(prediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4 mt-4">
            {isAnalyzing ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/20 animate-pulse">
                    <div className="h-4 bg-purple-500/20 rounded mb-2"></div>
                    <div className="h-3 bg-purple-500/10 rounded w-4/5"></div>
                  </div>
                ))}
              </div>
            ) : anomalies.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-200">No anomalies detected</p>
                <p className="text-sm text-green-300/70">Your spending patterns look normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-purple-200 mb-2">Spending Anomalies</h3>
                  <p className="text-sm text-purple-300/70">Unusual transactions detected by AI analysis</p>
                </div>
                {anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-yellow-500/20 mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-purple-100">
                            {anomaly.transaction.description}
                          </h4>
                          <Badge className={`${getAnomalySeverityColor(anomaly.severity)} text-white text-xs`}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mb-2 text-sm text-purple-300">
                          <span>${anomaly.transaction.amount.toFixed(2)}</span>
                          <span>{anomaly.transaction.category}</span>
                          <span>{new Date(anomaly.transaction.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-purple-300/80">{anomaly.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}