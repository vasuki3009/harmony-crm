import type { Department } from '../types/crm';
import { mockDepartments } from '../data/mockData';
import { apiRequest, isApiEnabled } from './apiClient';

let _mockStore: Department[] = [...mockDepartments];
const delay = () => new Promise(res => setTimeout(res, 400));

const mockApi = {
  getAll: async (): Promise<Department[]> => { await delay(); return [..._mockStore]; },
  create: async (data: Partial<Department>): Promise<Department> => {
    await delay();
    const dept: Department = {
      id: `d${Date.now()}`, name: data.name ?? '', headId: data.headId ?? '',
      employeeCount: 0, description: data.description,
      createdAt: new Date().toISOString().split('T')[0],
    };
    _mockStore = [..._mockStore, dept];
    return dept;
  },
  patch: async (id: string, patch: Record<string, unknown>): Promise<Department> => {
    await delay();
    _mockStore = _mockStore.map(d => d.id === id ? { ...d, ...patch } as Department : d);
    const updated = _mockStore.find(d => d.id === id);
    if (!updated) throw new Error(`Department ${id} not found`);
    return updated;
  },
  delete: async (id: string): Promise<void> => { await delay(); _mockStore = _mockStore.filter(d => d.id !== id); },
};

export const departmentsApi = {
  getAll: (): Promise<Department[]> =>
    isApiEnabled ? apiRequest<Department[]>('/api/departments') : mockApi.getAll(),
  create: (data: Partial<Department>): Promise<Department> =>
    isApiEnabled
      ? apiRequest<Department>('/api/departments', { method: 'POST', body: JSON.stringify(data) })
      : mockApi.create(data),
  patch: (id: string, patch: Record<string, unknown>): Promise<Department> =>
    isApiEnabled
      ? apiRequest<Department>(`/api/departments/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      : mockApi.patch(id, patch),
  delete: (id: string): Promise<void> =>
    isApiEnabled
      ? apiRequest<void>(`/api/departments/${id}`, { method: 'DELETE' })
      : mockApi.delete(id),
};
