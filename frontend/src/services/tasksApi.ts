import type { Task, TaskStatus, TaskPriority } from '../types/crm';
import { mockTasks } from '../data/mockData';
import { apiRequest, isApiEnabled } from './apiClient';

let _mockStore: Task[] = [...mockTasks];
const delay = () => new Promise(res => setTimeout(res, 400));

const mockApi = {
  getAll: async (): Promise<Task[]> => { await delay(); return [..._mockStore]; },
  create: async (data: Partial<Task>): Promise<Task> => {
    await delay();
    const task: Task = {
      id: `t${Date.now()}`, title: data.title ?? '', description: data.description ?? '',
      status: 'pending', priority: (data.priority as TaskPriority) ?? 'medium',
      assignedTo: data.assignedTo ?? '', createdBy: data.createdBy ?? 'u1',
      dueDate: data.dueDate ?? '', tags: data.tags ?? [], comments: 0,
    };
    _mockStore = [task, ..._mockStore];
    return task;
  },
  patch: async (id: string, patch: Partial<Task>): Promise<Task> => {
    await delay();
    _mockStore = _mockStore.map(t =>
      t.id === id ? { ...t, ...patch, completedAt: patch.status === 'completed' ? new Date().toISOString() : t.completedAt } : t
    );
    const updated = _mockStore.find(t => t.id === id);
    if (!updated) throw new Error(`Task ${id} not found`);
    return updated;
  },
  delete: async (id: string): Promise<void> => { await delay(); _mockStore = _mockStore.filter(t => t.id !== id); },
};

export const tasksApi = {
  getAll: (params?: { assignedTo?: string; status?: string }): Promise<Task[]> => {
    if (!isApiEnabled) return mockApi.getAll();
    const q = new URLSearchParams();
    if (params?.assignedTo) q.set('assignedTo', params.assignedTo);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return apiRequest<Task[]>(`/api/tasks${qs ? `?${qs}` : ''}`);
  },
  create: (data: Partial<Task>): Promise<Task> =>
    isApiEnabled
      ? apiRequest<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) })
      : mockApi.create(data),
  patch: (id: string, patch: Partial<Task>): Promise<Task> =>
    isApiEnabled
      ? apiRequest<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      : mockApi.patch(id, patch),
  delete: (id: string): Promise<void> =>
    isApiEnabled
      ? apiRequest<void>(`/api/tasks/${id}`, { method: 'DELETE' })
      : mockApi.delete(id),
};
