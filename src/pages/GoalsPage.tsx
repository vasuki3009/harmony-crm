import React from 'react';
import { mockGoals, mockUsers } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const goals = user?.role === 'admin'
    ? mockGoals
    : mockGoals.filter(g => g.userId === user?.id);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{goals.length} active goals</p>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground">
          <Plus className="w-3.5 h-3.5" /> Set Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const owner = mockUsers.find(u => u.id === goal.userId);
          const isComplete = pct >= 100;
          const isNear = pct >= 70 && !isComplete;

          return (
            <Card key={goal.id} className="card-shadow border-border hover:border-primary/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isComplete ? 'gradient-success' : 'gradient-primary'}`}>
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-xs ${isComplete ? 'bg-success/10 text-success border-success/20 border' : isNear ? 'bg-warning/10 text-warning border-warning/20 border' : 'bg-primary/10 text-primary border-primary/20 border'}`}>
                      {pct}%
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">{goal.period}</Badge>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-sm mb-1">{goal.title}</h3>
                {owner && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {owner.avatar}
                    </div>
                    <span>{owner.name}</span>
                  </div>
                )}

                <div className="mb-2">
                  <Progress value={pct} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : goal.current}
                    </span>
                    {' / '}
                    {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target} ${goal.unit}`}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Due {format(parseISO(goal.dueDate), 'MMM d')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No goals set yet</p>
          <p className="text-sm mt-1">Set monthly or weekly targets to track performance</p>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
