import { mockLeads, mockTasks, salesChartData, leadSourceData, leaderboardData } from '../data/mockData';
import { apiRequest, isApiEnabled } from './apiClient';

export interface DashboardStats {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  pipelineValue: number;
  wonRevenue: number;
  openTasks: number;
  overdueTasks: number;
  activeEmployees: number;
}

export interface SalesTrendPoint {
  month: string;
  revenue: number;
  leads: number;
  converted: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  converted: number;
  revenue: number;
}

export interface NameValue {
  name: string;
  value: number;
}

const mockDashboard = (): DashboardStats => {
  const converted = mockLeads.filter(l => l.status === 'converted');
  return {
    totalLeads: mockLeads.length,
    convertedLeads: converted.length,
    conversionRate: Math.round((converted.length / mockLeads.length) * 100),
    pipelineValue: mockLeads.filter(l => l.status !== 'converted' && l.status !== 'lost').reduce((s, l) => s + l.value, 0),
    wonRevenue: converted.reduce((s, l) => s + l.value, 0),
    openTasks: mockTasks.filter(t => t.status !== 'completed').length,
    overdueTasks: mockTasks.filter(t => t.status === 'overdue').length,
    activeEmployees: 7,
  };
};

const delay = () => new Promise(res => setTimeout(res, 300));

export const analyticsApi = {
  dashboard: (): Promise<DashboardStats> =>
    isApiEnabled
      ? apiRequest<DashboardStats>('/api/analytics/dashboard')
      : delay().then(mockDashboard),
  /** Share of leads per source in percent (the API returns raw counts). */
  leadSources: async (): Promise<NameValue[]> => {
    if (!isApiEnabled) {
      await delay();
      return leadSourceData;
    }
    const counts = await apiRequest<NameValue[]>('/api/analytics/lead-sources');
    const total = counts.reduce((sum, c) => sum + c.value, 0);
    return counts.map(c => ({ name: c.name, value: total ? Math.round((c.value * 100) / total) : 0 }));
  },
  salesTrend: (): Promise<SalesTrendPoint[]> =>
    isApiEnabled
      ? apiRequest<SalesTrendPoint[]>('/api/analytics/sales-trend')
      : delay().then(() => salesChartData),
  leaderboard: (): Promise<LeaderboardEntry[]> =>
    isApiEnabled
      ? apiRequest<LeaderboardEntry[]>('/api/analytics/leaderboard')
      : delay().then(() => leaderboardData.map(e => ({ rank: e.rank, userId: e.userId, name: e.name, avatar: e.avatar, converted: e.converted, revenue: e.revenue }))),
};
