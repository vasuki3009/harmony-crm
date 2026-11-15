import type { AttendanceRecord } from '../types/crm';
import { mockAttendance } from '../data/mockData';
import { apiRequest, isApiEnabled } from './apiClient';

let _mockStore: AttendanceRecord[] = [...mockAttendance];
const delay = () => new Promise(res => setTimeout(res, 400));

export const attendanceApi = {
  getAll: (userId?: string): Promise<AttendanceRecord[]> => {
    if (!isApiEnabled) {
      return delay().then(() => userId ? _mockStore.filter(r => r.userId === userId) : [..._mockStore]);
    }
    const qs = userId ? `?userId=${userId}` : '';
    return apiRequest<AttendanceRecord[]>(`/api/attendance${qs}`);
  },
  checkIn: (): Promise<AttendanceRecord> => {
    if (!isApiEnabled) {
      return delay().then(() => {
        const now = new Date();
        const rec: AttendanceRecord = {
          id: `a${Date.now()}`, userId: 'u1', date: now.toISOString().split('T')[0],
          checkIn: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          status: now.getHours() >= 9 && now.getMinutes() > 15 ? 'late' : 'present',
        };
        _mockStore = [rec, ..._mockStore];
        return rec;
      });
    }
    return apiRequest<AttendanceRecord>('/api/attendance/check-in', { method: 'POST' });
  },
  checkOut: (): Promise<AttendanceRecord> => {
    if (!isApiEnabled) {
      return delay().then(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        _mockStore = _mockStore.map(r =>
          r.date === today && r.checkIn && !r.checkOut
            ? { ...r, checkOut: timeStr, hoursWorked: parseFloat((Math.abs(now.getTime() - new Date(`${today}T${r.checkIn}:00`).getTime()) / 3600000).toFixed(1)) }
            : r
        );
        return _mockStore.find(r => r.date === today)!;
      });
    }
    return apiRequest<AttendanceRecord>('/api/attendance/check-out', { method: 'POST' });
  },
};
