import React, { useState, useCallback } from 'react';
import { mockAttendance as initialRecords, mockUsers } from '../data/mockData';
import type { AttendanceRecord } from '../types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Clock, AlertCircle, LogIn, LogOut, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const statusConfig = {
  present: { class: 'bg-success/10 text-success border-success/20', label: 'Present' },
  absent: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Absent' },
  late: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Late' },
  half_day: { class: 'bg-cold/10 text-cold border-cold/20', label: 'Half Day' },
};

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [checking, setChecking] = useState(false);
  const [filterUser, setFilterUser] = useState('all');

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.userId === user?.id && r.date === today);
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCheckedOut = !!todayRecord?.checkIn && !!todayRecord?.checkOut;

  const handleCheckIn = useCallback(async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 400));
    const now = new Date();
    const timeStr = format(now, 'HH:mm');
    const isLate = now.getHours() >= 9 && now.getMinutes() > 15;

    if (todayRecord) {
      // Check-out
      setRecords(prev => prev.map(r =>
        r.id === todayRecord.id
          ? { ...r, checkOut: timeStr, status: r.status, hoursWorked: parseFloat((Math.abs(now.getTime() - new Date(`${today}T${r.checkIn}:00`).getTime()) / 3600000).toFixed(1)) }
          : r
      ));
      toast({ title: '👋 Checked out', description: `You checked out at ${timeStr}.` });
    } else {
      // Check-in
      const newRecord: AttendanceRecord = {
        id: `a${Date.now()}`,
        userId: user!.id,
        date: today,
        checkIn: timeStr,
        status: isLate ? 'late' : 'present',
      };
      setRecords(prev => [newRecord, ...prev]);
      toast({ title: `✅ Checked in${isLate ? ' (Late)' : ''}`, description: `You checked in at ${timeStr}.` });
    }
    setChecking(false);
  }, [todayRecord, today, user]);

  const displayedRecords = filterUser === 'all'
    ? records
    : records.filter(r => r.userId === filterUser);

  const todayStats = {
    present: records.filter(r => r.date === today && r.status === 'present').length,
    late: records.filter(r => r.date === today && r.status === 'late').length,
    absent: mockUsers.length - records.filter(r => r.date === today).length,
    avgHours: (() => {
      const hrs = records.filter(r => r.hoursWorked).map(r => r.hoursWorked!);
      return hrs.length ? (hrs.reduce((a, b) => a + b, 0) / hrs.length).toFixed(1) : '—';
    })(),
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Check in/out card */}
      <Card className="card-shadow border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-display font-semibold text-base mb-0.5">Today's Attendance</h3>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {todayRecord?.checkIn && (
                <p className="text-xs text-muted-foreground mt-1">
                  Checked in at <span className="font-medium text-foreground">{todayRecord.checkIn}</span>
                  {todayRecord.checkOut && <> • Checked out at <span className="font-medium text-foreground">{todayRecord.checkOut}</span></>}
                  {todayRecord.hoursWorked && <> • <span className="font-medium text-success">{todayRecord.hoursWorked}h worked</span></>}
                </p>
              )}
              {!todayRecord && (
                <p className="text-xs text-warning mt-1">You haven't checked in today.</p>
              )}
            </div>
            <Button
              className={`h-10 gap-2 ${isCheckedOut ? 'bg-muted text-muted-foreground cursor-not-allowed' : isCheckedIn ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20' : 'gradient-primary text-primary-foreground'}`}
              onClick={isCheckedOut ? undefined : handleCheckIn}
              disabled={checking || isCheckedOut}
            >
              {checking
                ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                : isCheckedOut
                  ? <><Calendar className="w-4 h-4" />Completed</>
                  : isCheckedIn
                    ? <><LogOut className="w-4 h-4" />Check Out</>
                    : <><LogIn className="w-4 h-4" />Check In</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Present Today', count: todayStats.present, icon: UserCheck, color: 'text-success' },
          { label: 'Late Today', count: todayStats.late, icon: Clock, color: 'text-warning' },
          { label: 'Absent Today', count: todayStats.absent, icon: AlertCircle, color: 'text-destructive' },
          { label: 'Avg Hours', count: `${todayStats.avgHours}h`, icon: Clock, color: 'text-primary' },
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

      {/* Records table with filter */}
      <Card className="card-shadow border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Attendance Records</CardTitle>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name.split(' ')[0]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayedRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No records found.</p>
            ) : displayedRecords.map(record => {
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
