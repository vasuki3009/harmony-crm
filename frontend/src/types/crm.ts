// Types for the CRM system
export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  employeeCount: number;
  description?: string;
  createdAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type LeadTemperature = 'hot' | 'warm' | 'cold';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  temperature: LeadTemperature;
  score: number;
  assignedTo: string;
  value: number;
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastContact?: string;
  tags: string[];
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'note' | 'status_change' | 'task';
  description: string;
  performedBy: string;
  createdAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  completedAt?: string;
  tags: string[];
  leadId?: string;
  comments: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: 'weekly' | 'monthly';
  dueDate: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  hoursWorked?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'lead' | 'approval' | 'system';
  read: boolean;
  createdAt: string;
}

export interface KpiCard {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
  subtitle?: string;
}
