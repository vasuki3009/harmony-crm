import React, { useState } from 'react';
import { mockTasks, mockUsers } from '../data/mockData';
import type { Task, TaskStatus, TaskPriority } from '../types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, CheckSquare, Clock, AlertTriangle, User, Calendar, MessageSquare, Flag } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

const statusColumns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending', color: 'border-t-muted-foreground' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-primary' },
  { id: 'completed', label: 'Completed', color: 'border-t-success' },
  { id: 'overdue', label: 'Overdue', color: 'border-t-destructive' },
];

const priorityConfig: Record<TaskPriority, { label: string; class: string; icon: React.ReactNode }> = {
  low: { label: 'Low', class: 'bg-muted text-muted-foreground border-border', icon: <Flag className="w-2.5 h-2.5" /> },
  medium: { label: 'Medium', class: 'bg-cold/10 text-cold border-cold/20', icon: <Flag className="w-2.5 h-2.5" /> },
  high: { label: 'High', class: 'bg-warning/10 text-warning border-warning/20', icon: <Flag className="w-2.5 h-2.5" /> },
  critical: { label: 'Critical', class: 'bg-hot/10 text-hot border-hot/20', icon: <AlertTriangle className="w-2.5 h-2.5" /> },
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const assignee = mockUsers.find(u => u.id === task.assignedTo);
  const pConfig = priorityConfig[task.priority];
  const isOverdue = task.status !== 'completed' && isPast(parseISO(task.dueDate));

  return (
    <div className="bg-card border border-border rounded-xl p-3 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold leading-tight line-clamp-2">{task.title}</h4>
        </div>
        <Badge className={`border text-xs flex items-center gap-0.5 flex-shrink-0 ${pConfig.class}`}>
          {pConfig.icon} {pConfig.label}
        </Badge>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Calendar className="w-3 h-3" />
          <span>{format(parseISO(task.dueDate), 'MMM d')}</span>
          {isOverdue && <AlertTriangle className="w-2.5 h-2.5" />}
        </div>
        {task.comments > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            {task.comments}
          </div>
        )}
      </div>
      {assignee && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
          <div className="w-5 h-5 rounded gradient-primary flex items-center justify-center text-white text-xs font-bold">
            {assignee.avatar}
          </div>
          <span className="text-xs text-muted-foreground">{assignee.name.split(' ')[0]}</span>
        </div>
      )}
    </div>
  );
};

const TasksPage: React.FC = () => {
  const [tasks] = useState<Task[]>(mockTasks);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [view, setView] = useState<'board' | 'list'>('board');

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const getColTasks = (status: TaskStatus) => filtered.filter(t => t.status === status);

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
            <Input placeholder="Search tasks..." className="pl-8 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
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
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground">
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {statusColumns.map(col => (
            <div key={col.id} className={`bg-secondary/40 rounded-2xl p-3 border-t-4 ${col.color} min-h-64`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge variant="secondary" className="text-xs">{getColTasks(col.id).length}</Badge>
              </div>
              <div className="space-y-2">
                {getColTasks(col.id).map(task => <TaskCard key={task.id} task={task} />)}
                {getColTasks(col.id).length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const assignee = mockUsers.find(u => u.id === task.assignedTo);
            const pConfig = priorityConfig[task.priority];
            const isOverdue = task.status !== 'completed' && isPast(parseISO(task.dueDate));
            return (
              <div key={task.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer">
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${task.status === 'completed' ? 'bg-success' : task.status === 'overdue' ? 'bg-destructive' : task.status === 'in_progress' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                </div>
                <Badge className={`border text-xs ${pConfig.class} hidden sm:flex`}>{pConfig.label}</Badge>
                <div className={`text-xs hidden md:flex items-center gap-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(task.dueDate), 'MMM d')}
                </div>
                {assignee && (
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {assignee.avatar}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
