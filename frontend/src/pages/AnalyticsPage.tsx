import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { salesChartData, leadSourceData, leaderboardData, mockLeads, mockTasks } from '../data/mockData';
import { TrendingUp, BarChart3 } from 'lucide-react';

const CHART_COLORS = ['hsl(231, 70%, 55%)', 'hsl(165, 60%, 45%)', 'hsl(38, 90%, 52%)', 'hsl(280, 65%, 55%)', 'hsl(4, 80%, 55%)'];

const forecastData = salesChartData.map((d, i) => ({
  ...d,
  forecast: Math.round(d.revenue * (1 + 0.08 + i * 0.03)),
}));

const AnalyticsPage: React.FC = () => {
  const convRate = Math.round((mockLeads.filter(l => l.status === 'converted').length / mockLeads.length) * 100);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Conversion Rate', value: `${convRate}%`, note: '+4% vs last month' },
          { label: 'Avg Deal Value', value: '$38.5K', note: 'Per converted lead' },
          { label: 'Sales Cycle', value: '18 days', note: 'Average closure time' },
          { label: 'Pipeline Value', value: '$368K', note: 'Active opportunities' },
        ].map(k => (
          <Card key={k.label} className="card-shadow border-border">
            <CardContent className="p-4">
              <p className="text-2xl font-display font-bold text-primary">{k.value}</p>
              <p className="text-sm font-medium">{k.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue vs Forecast */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Revenue vs Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(231, 70%, 55%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(231, 70%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(165, 60%, 45%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(165, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(val: number) => [`$${val.toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" name="Actual" stroke="hsl(231, 70%, 55%)" fill="url(#gr1)" strokeWidth={2} />
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="hsl(165, 60%, 45%)" fill="url(#gr2)" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead status breakdown */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Lead Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { status: 'New', count: mockLeads.filter(l => l.status === 'new').length },
                { status: 'Contacted', count: mockLeads.filter(l => l.status === 'contacted').length },
                { status: 'Qualified', count: mockLeads.filter(l => l.status === 'qualified').length },
                { status: 'Converted', count: mockLeads.filter(l => l.status === 'converted').length },
                { status: 'Lost', count: mockLeads.filter(l => l.status === 'lost').length },
              ]} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(231, 70%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team performance */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Team Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leaderboardData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="score" fill="hsl(231, 70%, 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead sources */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lead Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {leadSourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {leadSourceData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-muted-foreground text-xs">{item.name}</span>
                    </div>
                    <span className="font-semibold text-xs">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
