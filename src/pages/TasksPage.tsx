import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { mockTasks, mockUsers } from '../data/mockData';
import type { Task, TaskStatus, TaskPriority } from '../types/crm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Plus, Search, Calendar, MessageSquare, Flag, AlertTriangle,
  Loader2, Trash2, CheckCircle2, Circle
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const statusColumns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending', color: 'border-t-muted-foreground' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-primary' },
  { id: 'completed', label: 'Completed', color: 'border-t-success' },
  { id: 'overdue', label: 'Overdue', color: 'border-t-destructive' },
];

const priorityConfig: Record<TaskPriority, { label: string; class: string }> = {
  low: { label: 'Low', class: 'bg-muted text-muted-foreground border-border' },
  medium: { label: 'Medium', class: 'bg-cold/10 text-cold border-cold/20' },
  high: { label: 'High', class: 'bg-warning/10 text-warning border-warning/20' },
  critical: { label: 'Critical', class: 'bg-hot/10 text-hot border-hot/20' },
};

const statusNextMap: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
  overdue: 'in_progress',
};

// ── Task Card ────────────────────────────────────────────────────────────────
const TaskCard: React.FC<{
  task: Task;
  onStatusChange: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}> = ({ task, onStatusChange, onDelete, deletingId }) => {
  const assignee = mockUsers.find(u => u.id === task.assignedTo);
  const pConfig = priorityConfig[task.priority];
  const isOverdue = task.status !== 'completed' && isPast(parseISO(task.dueDate));

  return (
    <div className="bg-card border border-border rounded-xl p-3 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-start gap-2 mb-2">
        <button
          className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => onStatusChange(task.id, statusNextMap[task.status])}
          title={`Mark as ${statusNextMap[task.status]}`}
        >
          {task.status === 'completed'
            ? <CheckCircle2 className="w-4 h-4 text-success" />
            : <Circle className="w-4 h-4" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold leading-tight line-clamp-2 ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h4>
        </div>
        <Badge className={`border text-xs flex-shrink-0 ${pConfig.class}`}>
          {task.priority === 'critical' ? <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> : <Flag className="w-2.5 h-2.5 mr-0.5" />}
          {pConfig.label}
        </Badge>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 pl-6">{task.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap pl-6">
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Calendar className="w-3 h-3" />
          <span>{format(parseISO(task.dueDate), 'MMM d')}</span>
          {isOverdue && <AlertTriangle className="w-2.5 h-2.5" />}
        </div>
        {task.comments > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="w-3 h-3" /> {task.comments}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border pl-6">
        {assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {assignee.avatar}
            </div>
            <span className="text-xs text-muted-foreground">{assignee.name.split(' ')[0]}</span>
          </div>
        ) : <span />}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
          disabled={deletingId === task.id}
        >
          {deletingId === task.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </div>
  );
};

// ── Add Task form values ─────────────────────────────────────────────────────
type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
};

const AddTaskModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues) => Promise<void>;
}> = ({ open, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues: { priority: 'medium', assignedTo: mockUsers[0]?.id ?? '' },
  });

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    try { await onSubmit(values); reset(); onClose(); }
    finally { setLoading(false); }
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input {...register('title', { required: 'Title is required' })} placeholder="Task title" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea {...register('description')} placeholder="Describe the task…" rows={3} />
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
              <Label>Assign To</Label>
              <Select defaultValue={mockUsers[0]?.id} onValueChange={v => setValue('assignedTo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Due Date *</Label>
            <Input type="date" {...register('dueDate', { required: 'Due date is required' })} />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Creating…</> : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [view, setView] = useState<'board' | 'list'>('board');
  const [addOpen, setAddOpen] = useState(false);
  const [dragTask, setDragTask] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const getColTasks = (status: TaskStatus) => filtered.filter(t => t.status === status);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async (values: TaskFormValues) => {
    await new Promise(r => setTimeout(r, 350));
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: values.title,
      description: values.description,
      status: 'pending',
      priority: values.priority,
      assignedTo: values.assignedTo,
      createdBy: 'u1',
      dueDate: values.dueDate,
      tags: [],
      comments: 0,
    };
    setTasks(prev => [newTask, ...prev]);
    toast({ title: '✅ Task created', description: `"${newTask.title}" added.` });
  }, []);

  const handleStatusChange = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
      : t
    ));
    const task = tasks.find(t => t.id === id);
    toast({ title: `Task updated`, description: `"${task?.title}" → ${status.replace('_', ' ')}` });
  }, [tasks]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    await new Promise(r => setTimeout(r, 300));
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeletingId(null);
    toast({ title: '🗑 Task deleted', description: `"${task?.title}" removed.` });
  }, [tasks]);

  const handleDrop = useCallback((status: TaskStatus) => {
    if (!dragTask) return;
    handleStatusChange(dragTask, status);
    setDragTask(null);
  }, [dragTask, handleStatusChange]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statusColumns.map(col => (
          <div key={col.id} className="bg-card border border-border rounded-xl p-3 card-shadow">
            <div className="text-2xl font-display font-bold">{tasks.filter(t => t.status === col.id).length}</div>
            <div className="text-xs text-muted-foreground">{col.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search tasks…" className="pl-8 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button className={`px-3 h-9 text-xs font-medium transition-colors ${view === 'board' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`} onClick={() => setView('board')}>Board</button>
            <button className={`px-3 h-9 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`} onClick={() => setView('list')}>List</button>
          </div>
        </div>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
      </div>

      {/* Board / List view */}
      {view === 'board' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {statusColumns.map(col => (
            <div
              key={col.id}
              className={`bg-secondary/40 rounded-2xl p-3 border-t-4 ${col.color} min-h-64 transition-colors ${dragTask ? 'border-dashed border-border' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge variant="secondary" className="text-xs">{getColTasks(col.id).length}</Badge>
              </div>
              <div className="space-y-2">
                {getColTasks(col.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDragTask(task.id)}
                    onDragEnd={() => setDragTask(null)}
                  >
                    <TaskCard task={task} onStatusChange={handleStatusChange} onDelete={handleDelete} deletingId={deletingId} />
                  </div>
                ))}
                {getColTasks(col.id).length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    {dragTask ? 'Drop here' : 'No tasks'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No tasks match your filters.</div>
          ) : filtered.map(task => {
            const assignee = mockUsers.find(u => u.id === task.assignedTo);
            const pConfig = priorityConfig[task.priority];
            const isOverdue = task.status !== 'completed' && isPast(parseISO(task.dueDate));
            return (
              <div key={task.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all group">
                <button
                  className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  onClick={() => handleStatusChange(task.id, statusNextMap[task.status])}
                >
                  {task.status === 'completed'
                    ? <CheckCircle2 className="w-5 h-5 text-success" />
                    : <Circle className="w-5 h-5" />
                  }
                </button>
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${task.status === 'completed' ? 'bg-success' : task.status === 'overdue' ? 'bg-destructive' : task.status === 'in_progress' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                </div>
                <Badge className={`border text-xs ${pConfig.class} hidden sm:flex`}>{pConfig.label}</Badge>
                <div className={`text-xs hidden md:flex items-center gap-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(task.dueDate), 'MMM d')}
                </div>
                {assignee && (
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{assignee.avatar}</div>
                )}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(task.id)}
                  disabled={deletingId === task.id}
                >
                  {deletingId === task.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleCreate} />
    </div>
  );
};

export default TasksPage;
