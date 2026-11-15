import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, Target, CheckSquare, ArrowUpRight, ArrowDownRight, Trophy, Flame, Thermometer, Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { salesChartData, leadSourceData, leaderboardData, mockLeads, mockTasks } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const KPICard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  gradient: string;
  subtitle: string;
}> = ({ title, value, change, icon, gradient, subtitle }) => (
  <Card className="card-shadow border-border animate-fade-in">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
          {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-2xl font-display font-bold mb-0.5">{value}</div>
      <div className="text-sm font-medium text-foreground/80">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
    </CardContent>
  </Card>
);

const CHART_COLORS = ['hsl(231, 70%, 55%)', 'hsl(165, 60%, 45%)', 'hsl(38, 90%, 52%)', 'hsl(280, 65%, 55%)', 'hsl(4, 80%, 55%)'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const totalLeads = mockLeads.length;
  const converted = mockLeads.filter(l => l.status === 'converted').length;
  const openTasks = mockTasks.filter(t => t.status !== 'completed').length;
  const totalRevenue = mockLeads.filter(l => l.status === 'converted').reduce((s, l) => s + l.value, 0);
  const hotLeads = mockLeads.filter(l => l.temperature === 'hot').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Good morning, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Here's what's happening in your pipeline today.</p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1.5 font-medium capitalize border-primary/30 text-primary">
          {user?.role}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Leads" value={String(totalLeads)} change={18} icon={<Target className="w-5 h-5" />} gradient="gradient-primary" subtitle="vs last month" />
        <KPICard title="Converted" value={String(converted)} change={12} icon={<TrendingUp className="w-5 h-5" />} gradient="gradient-success" subtitle="deals closed" />
        <KPICard title="Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} change={24} icon={<Trophy className="w-5 h-5" />} gradient="bg-warning" subtitle="total this quarter" />
        <KPICard title="Open Tasks" value={String(openTasks)} change={-5} icon={<CheckSquare className="w-5 h-5" />} gradient="bg-purple-500" subtitle="need attention" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <Card className="lg:col-span-2 card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue & Lead Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(231, 70%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(231, 70%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(165, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(165, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number, name: string) => [name === 'revenue' ? `$${val.toLocaleString()}` : val, name]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(231, 70%, 55%)" fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="converted" stroke="hsl(165, 60%, 45%)" fill="url(#colorConverted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead sources */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {leadSourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-1">
              {leadSourceData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leaderboard */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" />
              <CardTitle className="text-base font-semibold">Sales Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboardData.map(emp => (
              <div key={emp.rank} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  emp.rank === 1 ? 'bg-warning text-white' : emp.rank === 2 ? 'bg-muted-foreground/30 text-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {emp.rank}
                </div>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.converted} converted • ${(emp.revenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-primary">{emp.score}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hot leads */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-hot" />
              <CardTitle className="text-base font-semibold">Hot Leads ({hotLeads})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockLeads.filter(l => l.temperature === 'hot' && l.status !== 'converted' && l.status !== 'lost').slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl bg-hot/5 border border-hot/20 hover:bg-hot/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-hot">${(lead.value / 1000).toFixed(0)}K</p>
                  <Badge className="text-xs bg-hot/10 text-hot border-0 px-1.5">Score {lead.score}</Badge>
                </div>
              </div>
            ))}
            {mockLeads.filter(l => l.temperature === 'hot' && l.status !== 'converted' && l.status !== 'lost').length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hot leads right now</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
