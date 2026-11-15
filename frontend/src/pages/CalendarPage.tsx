import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { mockTasks as initialTasks } from '../data/mockData';
import type { Task, TaskPriority } from '../types/crm';
import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, addMonths, subMonths, isToday
} from 'date-fns';
import { toast } from '@/hooks/use-toast';

type EventFormValues = { title: string; description: string; priority: TaskPriority; date: string; };

const priorityColors: Record<TaskPriority, string> = {
  critical: 'bg-hot/20 text-hot',
  high: 'bg-warning/20 text-warning',
  medium: 'bg-primary/10 text-primary',
  low: 'bg-muted text-muted-foreground',
};

const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOffset = startOfMonth(currentMonth).getDay();

  const handleDayClick = useCallback((day: Date) => {
    const dayTasks = tasks.filter(t => {
      try { return isSameDay(parseISO(t.dueDate), day); } catch { return false; }
    });
    setSelectedDay(day);
    setSelectedDayTasks(dayTasks);
    setDayDetailOpen(true);
  }, [tasks]);

  const handleAddFromDay = useCallback(() => {
    setDayDetailOpen(false);
    setAddOpen(true);
  }, []);

  const { register, handleSubmit, setValue, reset } = useForm<EventFormValues>({
    defaultValues: { priority: 'medium', date: selectedDay ? format(selectedDay, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd') },
  });

  const [saving, setSaving] = useState(false);

  const submitEvent = handleSubmit(async (values) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 350));
    const newTask: Task = {
      id: `t${Date.now()}`, title: values.title, description: values.description,
      status: 'pending', priority: values.priority,
      assignedTo: 'u1', createdBy: 'u1',
      dueDate: values.date, tags: [], comments: 0,
    };
    setTasks(prev => [...prev, newTask]);
    setSaving(false);
    reset();
    setAddOpen(false);
    toast({ title: '✅ Event added', description: `"${newTask.title}" scheduled for ${values.date}.` });
  });

  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 7);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="card-shadow border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button size="sm" className="h-8 gap-1 gradient-primary text-primary-foreground ml-2" onClick={() => { setSelectedDay(new Date()); setAddOpen(true); }}>
                <Plus className="w-3.5 h-3.5" /> Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(day => {
              const today = isToday(day);
              const dayTasks = tasks.filter(t => {
                try { return isSameDay(parseISO(t.dueDate), day); } catch { return false; }
              });
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-16 p-1 rounded-xl border transition-all cursor-pointer hover:bg-secondary/80 hover:border-primary/30 ${today ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <p className={`text-xs font-semibold mb-1 text-center w-5 h-5 rounded-full mx-auto flex items-center justify-center ${today ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map(task => (
                      <div key={task.id} className={`text-xs rounded px-1 py-0.5 truncate ${priorityColors[task.priority]}`}>
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">+{dayTasks.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card className="card-shadow border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'critical' ? 'bg-hot' : task.priority === 'high' ? 'bg-warning' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
              </div>
              <Badge variant="outline" className="text-xs capitalize">{task.status.replace('_', ' ')}</Badge>
              <span className="text-xs text-muted-foreground flex-shrink-0">{format(parseISO(task.dueDate), 'MMM d')}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={dayDetailOpen} onOpenChange={setDayDetailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedDay ? format(selectedDay, 'EEEE, MMMM d') : ''}</DialogTitle>
          </DialogHeader>
          {selectedDayTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CalIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No events on this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayTasks.map(t => (
                <div key={t.id} className={`p-3 rounded-xl text-sm ${priorityColors[t.priority]} bg-opacity-10`}>
                  <p className="font-semibold">{t.title}</p>
                  {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAddFromDay}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { if (!v) setAddOpen(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Event / Task</DialogTitle></DialogHeader>
          <form onSubmit={submitEvent} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register('title', { required: true })} placeholder="Event title" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea {...register('description')} rows={2} placeholder="Details…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select defaultValue="medium" onValueChange={v => setValue('priority', v as TaskPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" defaultValue={selectedDay ? format(selectedDay, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} {...register('date', { required: true })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving} className="gradient-primary text-primary-foreground">
                {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Adding…</> : 'Add Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
