'use client';

import { useState, useEffect } from 'react';
import { FinancialGoal } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';
import { getGoals, addGoal, updateGoal, deleteGoal } from '@/lib/goals-storage';
import { EXPENSE_CATEGORIES } from '@/types/transaction';

export function FinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: '',
    priority: 'medium' as FinancialGoal['priority'],
    description: '',
  });

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      title: formData.title,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount),
      targetDate: formData.targetDate,
      category: formData.category,
      priority: formData.priority,
      description: formData.description,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
      setEditingGoal(null);
    } else {
      addGoal(goalData);
    }

    setGoals(getGoals());
    setShowForm(false);
    setFormData({
      title: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: '',
      priority: 'medium',
      description: '',
    });
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority,
      description: goal.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    setGoals(getGoals());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-indigo-300">
            <Target className="h-5 w-5" />
            Financial Goals
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Emergency Fund"
                  required
                />
              </div>
              <div>
                <Label htmlFor="goal-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target-amount">Target Amount</Label>
                <Input
                  id="target-amount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="10000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="current-amount">Current Amount</Label>
                <Input
                  id="current-amount"
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="2500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Save for 6 months of expenses..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                  setFormData({
                    title: '',
                    targetAmount: '',
                    currentAmount: '',
                    targetDate: '',
                    category: '',
                    priority: 'medium',
                    description: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
              <p className="text-indigo-200">No financial goals set yet</p>
              <p className="text-sm text-indigo-300/70">Create your first goal to start tracking your progress</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = getDaysRemaining(goal.targetDate);
              
              return (
                <div key={goal.id} className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-indigo-100 mb-1">{goal.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getPriorityColor(goal.priority)} text-white`}>
                          {goal.priority}
                        </Badge>
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                          {goal.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(goal)}
                        className="h-8 w-8 p-0 hover:bg-indigo-500/20"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(goal.id)}
                        className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-indigo-200">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </span>
                      <span className="text-sm text-indigo-300">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-indigo-300">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 
                         daysRemaining === 0 ? 'Due today' : `${Math.abs(daysRemaining)} days overdue`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-300">
                      <DollarSign className="h-3 w-3" />
                      <span>${(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining</span>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-indigo-200/70 mt-2">{goal.description}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}