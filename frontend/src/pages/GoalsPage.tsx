import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { mockGoals as initialGoals, mockUsers } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Goal } from '../types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Calendar, Loader2, Trash2, Edit, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type GoalFormValues = {
  title: string;
  target: number;
  current: number;
  unit: string;
  period: 'weekly' | 'monthly';
  dueDate: string;
  userId: string;
};

const GoalModal: React.FC<{
  open: boolean;
  editing: Goal | null;
  onClose: () => void;
  onSubmit: (data: GoalFormValues, id?: string) => Promise<void>;
}> = ({ open, editing, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, reset } = useForm<GoalFormValues>({
    defaultValues: editing
      ? { title: editing.title, target: editing.target, current: editing.current, unit: editing.unit, period: editing.period, dueDate: editing.dueDate, userId: editing.userId }
      : { period: 'monthly', unit: 'leads', userId: mockUsers[0]?.id ?? '' },
  });

  React.useEffect(() => {
    if (editing) reset({ title: editing.title, target: editing.target, current: editing.current, unit: editing.unit, period: editing.period, dueDate: editing.dueDate, userId: editing.userId });
    else reset({ period: 'monthly', unit: 'leads', userId: mockUsers[0]?.id ?? '' });
  }, [editing, open]);

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    try { await onSubmit(values, editing?.id); onClose(); }
    finally { setLoading(false); }
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !loading) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'Edit Goal' : 'Set New Goal'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Goal Title *</Label>
            <Input {...register('title', { required: true })} placeholder="e.g. Convert Leads" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Target</Label>
              <Input type="number" min={0} {...register('target', { valueAsNumber: true })} placeholder="100" />
            </div>
            <div className="space-y-1.5">
              <Label>Current</Label>
              <Input type="number" min={0} {...register('current', { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input {...register('unit')} placeholder="leads / $ / calls" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select defaultValue={editing?.period ?? 'monthly'} onValueChange={v => setValue('period', v as 'weekly' | 'monthly')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" {...register('dueDate')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assign To</Label>
            <Select defaultValue={editing?.userId ?? mockUsers[0]?.id} onValueChange={v => setValue('userId', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{editing ? 'Saving…' : 'Creating…'}</> : editing ? 'Save Changes' : 'Set Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const visibleGoals = user?.role === 'admin' ? goals : goals.filter(g => g.userId === user?.id);

  const handleSubmit = useCallback(async (data: GoalFormValues, id?: string) => {
    await new Promise(r => setTimeout(r, 350));
    if (id) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
      toast({ title: '✅ Goal updated' });
    } else {
      const newGoal: Goal = { id: `g${Date.now()}`, ...data };
      setGoals(prev => [...prev, newGoal]);
      toast({ title: '✅ Goal set', description: `"${data.title}" created.` });
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const goal = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(g => g.id !== id));
    toast({ title: '🗑 Goal removed', description: `"${goal?.title}" deleted.` });
  }, [goals]);

  // Update progress inline
  const handleUpdateProgress = useCallback((id: string, delta: number) => {
    setGoals(prev => prev.map(g => g.id === id
      ? { ...g, current: Math.max(0, Math.min(g.target, g.current + delta)) }
      : g
    ));
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{visibleGoals.length} active goals</p>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="w-3.5 h-3.5" /> Set Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleGoals.map(goal => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const owner = mockUsers.find(u => u.id === goal.userId);
          const isComplete = pct >= 100;
          const isNear = pct >= 70 && !isComplete;

          return (
            <Card key={goal.id} className="card-shadow border-border hover:border-primary/30 transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isComplete ? 'bg-success/20' : 'gradient-primary'}`}>
                    <Target className={`w-4 h-4 ${isComplete ? 'text-success' : 'text-white'}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`text-xs ${isComplete ? 'bg-success/10 text-success border-success/20 border' : isNear ? 'bg-warning/10 text-warning border-warning/20 border' : 'bg-primary/10 text-primary border-primary/20 border'}`}>
                      {pct}%
                    </Badge>
                    <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setEditing(goal); setModalOpen(true); }}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-sm mb-1">{goal.title}</h3>
                {owner && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded gradient-primary flex items-center justify-center text-white text-xs font-bold">{owner.avatar}</div>
                    <span>{owner.name}</span>
                    <Badge variant="outline" className="text-xs capitalize">{goal.period}</Badge>
                  </div>
                )}

                <div className="mb-2">
                  <Progress value={pct} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : goal.current}
                    </span>
                    {' / '}
                    {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target} ${goal.unit}`}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(parseISO(goal.dueDate), 'MMM d')}</span>
                  </div>
                </div>

                {/* Quick progress update */}
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs"
                    onClick={() => handleUpdateProgress(goal.id, -1)}>−1</Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs"
                    onClick={() => handleUpdateProgress(goal.id, 1)}>+1</Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs"
                    onClick={() => handleUpdateProgress(goal.id, 5)}>+5</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {visibleGoals.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No goals set yet</p>
          <p className="text-sm mt-1">Set monthly or weekly targets to track performance</p>
          <Button size="sm" className="mt-4 gradient-primary text-primary-foreground" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Set your first goal
          </Button>
        </div>
      )}

      <GoalModal open={modalOpen} editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={handleSubmit} />
    </div>
  );
};

export default GoalsPage;
