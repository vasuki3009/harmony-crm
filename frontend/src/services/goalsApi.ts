import type { Goal } from '../types/crm';
import { mockGoals } from '../data/mockData';
import { apiRequest, isApiEnabled } from './apiClient';

let _mockStore: Goal[] = [...mockGoals];
const delay = () => new Promise(res => setTimeout(res, 400));

const mockApi = {
  getAll: async (): Promise<Goal[]> => { await delay(); return [..._mockStore]; },
  create: async (data: Partial<Goal>): Promise<Goal> => {
    await delay();
    const goal: Goal = {
      id: `g${Date.now()}`, userId: data.userId ?? '', title: data.title ?? '',
      target: data.target ?? 0, current: data.current ?? 0, unit: data.unit ?? '',
      period: data.period ?? 'monthly', dueDate: data.dueDate ?? '',
    };
    _mockStore = [..._mockStore, goal];
    return goal;
  },
  patch: async (id: string, patch: Record<string, unknown>): Promise<Goal> => {
    await delay();
    _mockStore = _mockStore.map(g => g.id === id ? { ...g, ...patch } as Goal : g);
    const updated = _mockStore.find(g => g.id === id);
    if (!updated) throw new Error(`Goal ${id} not found`);
    return updated;
  },
  delete: async (id: string): Promise<void> => { await delay(); _mockStore = _mockStore.filter(g => g.id !== id); },
};

export const goalsApi = {
  getAll: (userId?: string): Promise<Goal[]> => {
    if (!isApiEnabled) return mockApi.getAll();
    const qs = userId ? `?userId=${userId}` : '';
    return apiRequest<Goal[]>(`/api/goals${qs}`);
  },
  create: (data: Partial<Goal>): Promise<Goal> =>
    isApiEnabled
      ? apiRequest<Goal>('/api/goals', { method: 'POST', body: JSON.stringify(data) })
      : mockApi.create(data),
  patch: (id: string, patch: Record<string, unknown>): Promise<Goal> =>
    isApiEnabled
      ? apiRequest<Goal>(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      : mockApi.patch(id, patch),
  delete: (id: string): Promise<void> =>
    isApiEnabled
      ? apiRequest<void>(`/api/goals/${id}`, { method: 'DELETE' })
      : mockApi.delete(id),
};
