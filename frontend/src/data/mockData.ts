import type { User, Department, Lead, Task, Goal, AttendanceRecord, Notification, LeadActivity } from '../types/crm';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Carter', email: 'alex@nexuscrm.io', role: 'admin', department: 'Executive', avatar: 'AC', phone: '+1 555-0100', joinDate: '2022-01-15', status: 'active' },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah@nexuscrm.io', role: 'manager', department: 'Sales', avatar: 'SJ', phone: '+1 555-0101', joinDate: '2022-03-20', status: 'active' },
  { id: 'u3', name: 'Michael Chen', email: 'michael@nexuscrm.io', role: 'employee', department: 'Sales', avatar: 'MC', phone: '+1 555-0102', joinDate: '2022-06-10', status: 'active' },
  { id: 'u4', name: 'Emily Rodriguez', email: 'emily@nexuscrm.io', role: 'employee', department: 'Marketing', avatar: 'ER', phone: '+1 555-0103', joinDate: '2022-08-05', status: 'active' },
  { id: 'u5', name: 'James Wilson', email: 'james@nexuscrm.io', role: 'employee', department: 'Sales', avatar: 'JW', phone: '+1 555-0104', joinDate: '2023-01-12', status: 'active' },
  { id: 'u6', name: 'Priya Patel', email: 'priya@nexuscrm.io', role: 'manager', department: 'Marketing', avatar: 'PP', phone: '+1 555-0105', joinDate: '2022-04-18', status: 'active' },
  { id: 'u7', name: 'David Kim', email: 'david@nexuscrm.io', role: 'employee', department: 'Support', avatar: 'DK', phone: '+1 555-0106', joinDate: '2023-03-08', status: 'active' },
  { id: 'u8', name: 'Lisa Thompson', email: 'lisa@nexuscrm.io', role: 'employee', department: 'Marketing', avatar: 'LT', phone: '+1 555-0107', joinDate: '2023-05-22', status: 'inactive' },
];

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Sales', headId: 'u2', employeeCount: 8, description: 'Revenue generation and client acquisition', createdAt: '2022-01-01' },
  { id: 'd2', name: 'Marketing', headId: 'u6', employeeCount: 5, description: 'Brand management and lead generation', createdAt: '2022-01-01' },
  { id: 'd3', name: 'Support', headId: 'u7', employeeCount: 4, description: 'Customer success and technical support', createdAt: '2022-01-01' },
  { id: 'd4', name: 'Engineering', headId: 'u1', employeeCount: 10, description: 'Product development and infrastructure', createdAt: '2022-01-01' },
  { id: 'd5', name: 'Executive', headId: 'u1', employeeCount: 3, description: 'Leadership and strategy', createdAt: '2022-01-01' },
];

export const mockLeads: Lead[] = [
  { id: 'l1', name: 'TechCorp Solutions', email: 'contact@techcorp.com', phone: '+1 555-2001', company: 'TechCorp Solutions', status: 'qualified', temperature: 'hot', score: 92, assignedTo: 'u3', value: 45000, source: 'Website', notes: 'Very interested in Enterprise plan', createdAt: '2024-01-10', updatedAt: '2024-01-20', lastContact: '2024-01-19', tags: ['enterprise', 'tech'] },
  { id: 'l2', name: 'Global Retail Inc', email: 'info@globalretail.com', phone: '+1 555-2002', company: 'Global Retail Inc', status: 'contacted', temperature: 'warm', score: 68, assignedTo: 'u5', value: 28000, source: 'LinkedIn', notes: 'Follow up next week', createdAt: '2024-01-12', updatedAt: '2024-01-18', lastContact: '2024-01-18', tags: ['retail', 'smb'] },
  { id: 'l3', name: 'StartupHub', email: 'hello@startuphub.io', phone: '+1 555-2003', company: 'StartupHub', status: 'new', temperature: 'cold', score: 35, assignedTo: 'u4', value: 8000, source: 'Cold Email', notes: '', createdAt: '2024-01-15', updatedAt: '2024-01-15', tags: ['startup'] },
  { id: 'l4', name: 'Meridian Finance', email: 'sales@meridian.com', phone: '+1 555-2004', company: 'Meridian Finance', status: 'converted', temperature: 'hot', score: 98, assignedTo: 'u3', value: 120000, source: 'Referral', notes: 'Closed deal', createdAt: '2023-12-01', updatedAt: '2024-01-05', lastContact: '2024-01-05', tags: ['finance', 'enterprise'] },
  { id: 'l5', name: 'BlueSky Media', email: 'contact@bluesky.media', phone: '+1 555-2005', company: 'BlueSky Media', status: 'qualified', temperature: 'warm', score: 74, assignedTo: 'u5', value: 22000, source: 'Trade Show', notes: 'Budget approved Q1', createdAt: '2024-01-08', updatedAt: '2024-01-17', lastContact: '2024-01-16', tags: ['media', 'smb'] },
  { id: 'l6', name: 'NovaTech Labs', email: 'bd@novatech.io', phone: '+1 555-2006', company: 'NovaTech Labs', status: 'lost', temperature: 'cold', score: 20, assignedTo: 'u3', value: 15000, source: 'Website', notes: 'Went with competitor', createdAt: '2023-11-20', updatedAt: '2024-01-10', tags: ['tech'] },
  { id: 'l7', name: 'Apex Consulting', email: 'info@apexco.com', phone: '+1 555-2007', company: 'Apex Consulting', status: 'contacted', temperature: 'hot', score: 85, assignedTo: 'u2', value: 55000, source: 'LinkedIn', notes: 'Needs demo this week', createdAt: '2024-01-14', updatedAt: '2024-01-20', lastContact: '2024-01-20', tags: ['consulting', 'enterprise'] },
  { id: 'l8', name: 'Skyline Properties', email: 'cto@skyline.re', phone: '+1 555-2008', company: 'Skyline Properties', status: 'new', temperature: 'warm', score: 55, assignedTo: 'u4', value: 18000, source: 'Event', notes: '', createdAt: '2024-01-19', updatedAt: '2024-01-19', tags: ['realestate'] },
];

export const mockLeadActivities: LeadActivity[] = [
  { id: 'la1', leadId: 'l1', type: 'call', description: 'Initial discovery call — 30 min. Discussed pain points.', performedBy: 'u3', createdAt: '2024-01-11T10:00:00Z' },
  { id: 'la2', leadId: 'l1', type: 'email', description: 'Sent proposal deck and pricing sheet.', performedBy: 'u3', createdAt: '2024-01-13T14:30:00Z' },
  { id: 'la3', leadId: 'l1', type: 'status_change', description: 'Status changed: Contacted → Qualified', performedBy: 'u3', createdAt: '2024-01-16T09:00:00Z' },
  { id: 'la4', leadId: 'l1', type: 'note', description: 'Very interested in the Enterprise plan. Budget ~$45k confirmed.', performedBy: 'u2', createdAt: '2024-01-19T11:15:00Z' },
  { id: 'la5', leadId: 'l4', type: 'status_change', description: 'Status changed: Qualified → Converted', performedBy: 'u3', createdAt: '2024-01-05T16:00:00Z' },
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Follow up with TechCorp Solutions', description: 'Schedule demo meeting and send product overview', status: 'in_progress', priority: 'high', assignedTo: 'u3', createdBy: 'u2', dueDate: '2024-01-25', tags: ['lead', 'demo'], leadId: 'l1', comments: 3 },
  { id: 't2', title: 'Prepare Q1 Sales Report', description: 'Compile all lead conversions and revenue data for Q1', status: 'pending', priority: 'medium', assignedTo: 'u2', createdBy: 'u1', dueDate: '2024-02-01', tags: ['report', 'sales'], comments: 1 },
  { id: 't3', title: 'Update CRM documentation', description: 'Document new lead qualification process', status: 'completed', priority: 'low', assignedTo: 'u4', createdBy: 'u6', dueDate: '2024-01-20', completedAt: '2024-01-19', tags: ['docs'], comments: 0 },
  { id: 't4', title: 'Cold call campaign — 50 leads', description: 'Call all cold leads in database and update status', status: 'pending', priority: 'high', assignedTo: 'u5', createdBy: 'u2', dueDate: '2024-01-22', tags: ['calls', 'leads'], comments: 2 },
  { id: 't5', title: 'Product demo for Apex Consulting', description: 'Prepare and deliver live demo for Apex team', status: 'pending', priority: 'critical', assignedTo: 'u2', createdBy: 'u1', dueDate: '2024-01-21', leadId: 'l7', tags: ['demo', 'enterprise'], comments: 5 },
  { id: 't6', title: 'Onboard new sales team members', description: 'CRM training for 3 new hires joining Feb 1', status: 'pending', priority: 'medium', assignedTo: 'u2', createdBy: 'u1', dueDate: '2024-02-01', tags: ['hr', 'training'], comments: 0 },
  { id: 't7', title: 'Set up email automation for leads', description: 'Configure drip campaign in marketing tool', status: 'overdue', priority: 'high', assignedTo: 'u4', createdBy: 'u6', dueDate: '2024-01-15', tags: ['automation', 'email'], comments: 4 },
  { id: 't8', title: 'Monthly support tickets review', description: 'Analyze top support issues and create FAQ', status: 'in_progress', priority: 'medium', assignedTo: 'u7', createdBy: 'u1', dueDate: '2024-01-31', tags: ['support'], comments: 1 },
];

export const mockGoals: Goal[] = [
  { id: 'g1', userId: 'u3', title: 'Convert Leads', target: 10, current: 7, unit: 'leads', period: 'monthly', dueDate: '2024-01-31' },
  { id: 'g2', userId: 'u3', title: 'Revenue Target', target: 150000, current: 98000, unit: '$', period: 'monthly', dueDate: '2024-01-31' },
  { id: 'g3', userId: 'u5', title: 'New Leads', target: 20, current: 14, unit: 'leads', period: 'monthly', dueDate: '2024-01-31' },
  { id: 'g4', userId: 'u5', title: 'Calls Made', target: 100, current: 67, unit: 'calls', period: 'monthly', dueDate: '2024-01-31' },
  { id: 'g2b', userId: 'u2', title: 'Team Revenue', target: 500000, current: 312000, unit: '$', period: 'monthly', dueDate: '2024-01-31' },
  { id: 'g3b', userId: 'u4', title: 'MQLs Generated', target: 40, current: 28, unit: 'leads', period: 'monthly', dueDate: '2024-01-31' },
];

export const mockAttendance: AttendanceRecord[] = [
  { id: 'a1', userId: 'u3', date: '2024-01-22', checkIn: '09:02', checkOut: '17:45', status: 'present', hoursWorked: 8.7 },
  { id: 'a2', userId: 'u3', date: '2024-01-21', checkIn: '09:30', checkOut: '18:00', status: 'late', hoursWorked: 8.5 },
  { id: 'a3', userId: 'u3', date: '2024-01-20', checkIn: '08:55', checkOut: '17:00', status: 'present', hoursWorked: 8.1 },
  { id: 'a4', userId: 'u5', date: '2024-01-22', checkIn: '09:00', checkOut: '17:30', status: 'present', hoursWorked: 8.5 },
  { id: 'a5', userId: 'u4', date: '2024-01-22', status: 'absent' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u2', title: 'New lead assigned', message: 'Skyline Properties has been assigned to your team', type: 'lead', read: false, createdAt: '2024-01-22T08:30:00Z' },
  { id: 'n2', userId: 'u2', title: 'Task deadline approaching', message: '"Product demo for Apex Consulting" is due tomorrow', type: 'task', read: false, createdAt: '2024-01-20T15:00:00Z' },
  { id: 'n3', userId: 'u2', title: 'Leave request', message: 'Michael Chen requested 2 days leave (Jan 28-29)', type: 'approval', read: true, createdAt: '2024-01-19T11:00:00Z' },
  { id: 'n4', userId: 'u2', title: 'Lead converted!', message: 'Meridian Finance has been converted — $120,000 deal', type: 'lead', read: true, createdAt: '2024-01-18T16:00:00Z' },
];

export const leaderboardData = [
  { rank: 1, userId: 'u3', name: 'Michael Chen', avatar: 'MC', converted: 7, revenue: 98000, score: 98, change: '+2' },
  { rank: 2, userId: 'u2', name: 'Sarah Johnson', avatar: 'SJ', converted: 12, revenue: 312000, score: 95, change: '0' },
  { rank: 3, userId: 'u5', name: 'James Wilson', avatar: 'JW', converted: 5, revenue: 56000, score: 78, change: '+1' },
  { rank: 4, userId: 'u4', name: 'Emily Rodriguez', avatar: 'ER', converted: 3, revenue: 32000, score: 65, change: '-1' },
  { rank: 5, userId: 'u7', name: 'David Kim', avatar: 'DK', converted: 2, revenue: 18000, score: 52, change: '0' },
];

export const salesChartData = [
  { month: 'Aug', revenue: 42000, leads: 18, converted: 4 },
  { month: 'Sep', revenue: 58000, leads: 24, converted: 6 },
  { month: 'Oct', revenue: 51000, leads: 21, converted: 5 },
  { month: 'Nov', revenue: 76000, leads: 32, converted: 9 },
  { month: 'Dec', revenue: 89000, leads: 38, converted: 11 },
  { month: 'Jan', revenue: 98000, leads: 42, converted: 14 },
];

export const leadSourceData = [
  { name: 'Website', value: 35 },
  { name: 'LinkedIn', value: 28 },
  { name: 'Referral', value: 20 },
  { name: 'Trade Show', value: 10 },
  { name: 'Cold Email', value: 7 },
];
