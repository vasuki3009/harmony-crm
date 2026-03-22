import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalIcon } from 'lucide-react';
import { mockTasks } from '../data/mockData';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const CalendarPage: React.FC = () => {
  const today = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
  const firstDayOffset = startOfMonth(today).getDay();

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="card-shadow border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CalIcon className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">{format(today, 'MMMM yyyy')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(day => {
              const isToday = isSameDay(day, today);
              const dayTasks = mockTasks.filter(t => {
                try { return isSameDay(parseISO(t.dueDate), day); } catch { return false; }
              });
              return (
                <div key={day.toISOString()} className={`min-h-16 p-1 rounded-xl border transition-colors cursor-pointer hover:bg-secondary ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <p className={`text-xs font-semibold mb-1 text-center ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map(task => (
                      <div key={task.id} className={`text-xs rounded px-1 py-0.5 truncate ${
                        task.priority === 'critical' ? 'bg-hot/20 text-hot' :
                        task.priority === 'high' ? 'bg-warning/20 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
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

      {/* Upcoming tasks */}
      <Card className="card-shadow border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Upcoming This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockTasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'critical' ? 'bg-hot' : task.priority === 'high' ? 'bg-warning' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {format(parseISO(task.dueDate), 'MMM d')}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
