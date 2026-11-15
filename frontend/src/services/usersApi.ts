import type { User, UserRole } from '../types/crm';
import { mockUsers } from '../data/mockData';
import { apiRequest, isApiEnabled } from './apiClient';

let _mockStore: User[] = [...mockUsers];
const delay = () => new Promise(res => setTimeout(res, 400));

const mockApi = {
  getAll: async (): Promise<User[]> => { await delay(); return [..._mockStore]; },
  create: async (data: { name: string; email: string; password?: string; role: UserRole; department: string; phone?: string }): Promise<User> => {
    await delay();
    const user: User = {
      id: `u${Date.now()}`, name: data.name, email: data.email,
      role: data.role, department: data.department, phone: data.phone,
      avatar: data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      joinDate: new Date().toISOString().split('T')[0], status: 'active',
    };
    _mockStore = [user, ..._mockStore];
    return user;
  },
  patch: async (id: string, patch: Record<string, unknown>): Promise<User> => {
    await delay();
    _mockStore = _mockStore.map(u => u.id === id ? { ...u, ...patch } as User : u);
    const updated = _mockStore.find(u => u.id === id);
    if (!updated) throw new Error(`User ${id} not found`);
    return updated;
  },
  delete: async (id: string): Promise<void> => { await delay(); _mockStore = _mockStore.filter(u => u.id !== id); },
};

export const usersApi = {
  getAll: (): Promise<User[]> =>
    isApiEnabled ? apiRequest<User[]>('/api/users') : mockApi.getAll(),
  create: (data: { name: string; email: string; password?: string; role: UserRole; department: string; phone?: string }): Promise<User> =>
    isApiEnabled
      ? apiRequest<User>('/api/users', { method: 'POST', body: JSON.stringify(data) })
      : mockApi.create(data),
  patch: (id: string, patch: Record<string, unknown>): Promise<User> =>
    isApiEnabled
      ? apiRequest<User>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      : mockApi.patch(id, patch),
  delete: (id: string): Promise<void> =>
    isApiEnabled
      ? apiRequest<void>(`/api/users/${id}`, { method: 'DELETE' })
      : mockApi.delete(id),
};
