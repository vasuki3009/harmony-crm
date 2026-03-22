import React from 'react';
import { mockAttendance, mockUsers } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Clock, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  present: { class: 'bg-success/10 text-success border-success/20', label: 'Present' },
  absent: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Absent' },
  late: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Late' },
  half_day: { class: 'bg-cold/10 text-cold border-cold/20', label: 'Half Day' },
};

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const records = mockAttendance;

  const todayRecord = records.find(r => r.userId === user?.id && r.date === today);
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Check in/out card */}
      <Card className="card-shadow border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-display font-semibold text-base mb-0.5">Today's Attendance</h3>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              {todayRecord?.checkIn && (
                <p className="text-xs text-muted-foreground mt-1">
                  Checked in at <span className="font-medium text-foreground">{todayRecord.checkIn}</span>
                  {todayRecord.checkOut && <> • Out at <span className="font-medium text-foreground">{todayRecord.checkOut}</span></>}
                </p>
              )}
            </div>
            <Button className={`h-10 gap-2 ${isCheckedIn ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20' : 'gradient-primary text-primary-foreground'}`}>
              {isCheckedIn ? <><LogOut className="w-4 h-4" /> Check Out</> : <><LogIn className="w-4 h-4" /> Check In</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Present', count: records.filter(r => r.status === 'present').length, icon: UserCheck, color: 'text-success' },
          { label: 'Late', count: records.filter(r => r.status === 'late').length, icon: Clock, color: 'text-warning' },
          { label: 'Absent', count: records.filter(r => r.status === 'absent').length, icon: AlertCircle, color: 'text-destructive' },
          { label: 'Avg Hours', count: '8.4h', icon: Clock, color: 'text-primary' },
        ].map(s => (
          <Card key={s.label} className="card-shadow border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-7 h-7 ${s.color}`} />
              <div>
                <p className="text-xl font-display font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Records table */}
      <Card className="card-shadow border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {records.map(record => {
              const emp = mockUsers.find(u => u.id === record.userId);
              const sConfig = statusConfig[record.status];
              return (
                <div key={record.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {emp?.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{emp?.name}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                  </div>
                  {record.checkIn && <span className="text-xs text-muted-foreground hidden sm:block">In: {record.checkIn}</span>}
                  {record.checkOut && <span className="text-xs text-muted-foreground hidden sm:block">Out: {record.checkOut}</span>}
                  {record.hoursWorked && <span className="text-xs font-medium hidden md:block">{record.hoursWorked}h</span>}
                  <Badge className={`border text-xs ${sConfig.class}`}>{sConfig.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
