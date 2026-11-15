import type { Lead, LeadStatus } from '../types/crm';
import { mockLeads } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL;

// In-memory store for mock backend
let _mockStore: Lead[] = [...mockLeads];

const simulateDelay = () => new Promise(res => setTimeout(res, 400));

// ─── Real API helpers ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Mock API helpers ────────────────────────────────────────────────────────

const mockApi = {
  getAll: async (): Promise<Lead[]> => {
    await simulateDelay();
    return [..._mockStore];
  },
  create: async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    await simulateDelay();
    const lead: Lead = {
      ...data,
      id: `l${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    _mockStore = [lead, ..._mockStore];
    return lead;
  },
  update: async (id: string, patch: Partial<Lead>): Promise<Lead> => {
    await simulateDelay();
    _mockStore = _mockStore.map(l =>
      l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString().split('T')[0] } : l
    );
    const updated = _mockStore.find(l => l.id === id);
    if (!updated) throw new Error(`Lead ${id} not found`);
    return updated;
  },
  delete: async (id: string): Promise<void> => {
    await simulateDelay();
    _mockStore = _mockStore.filter(l => l.id !== id);
  },
};

// ─── Public API surface ──────────────────────────────────────────────────────

export const leadsApi = {
  /** GET /api/leads */
  getAll: (): Promise<Lead[]> =>
    API_URL ? apiFetch<Lead[]>('/api/leads') : mockApi.getAll(),

  /** POST /api/leads */
  create: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> =>
    API_URL
      ? apiFetch<Lead>('/api/leads', { method: 'POST', body: JSON.stringify(data) })
      : mockApi.create(data),

  /** PATCH /api/leads/:id */
  update: (id: string, patch: Partial<Lead>): Promise<Lead> =>
    API_URL
      ? apiFetch<Lead>(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      : mockApi.update(id, patch),

  /** DELETE /api/leads/:id */
  delete: (id: string): Promise<void> =>
    API_URL
      ? apiFetch<void>(`/api/leads/${id}`, { method: 'DELETE' })
      : mockApi.delete(id),

  /** Convenience: change only status */
  updateStatus: (id: string, status: LeadStatus): Promise<Lead> =>
    leadsApi.update(id, { status }),
};
