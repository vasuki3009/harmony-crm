import React, { useState } from 'react';
import { mockUsers, mockDepartments } from '../data/mockData';
import type { User } from '../types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Plus, Search, Mail, Phone, Edit, Trash2, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const roleColors = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  manager: 'bg-accent/10 text-accent border-accent/20',
  employee: 'bg-warning/10 text-warning border-warning/20',
};

const EmployeeCard: React.FC<{ user: User }> = ({ user }) => {
  const dept = mockDepartments.find(d => d.name === user.department);
  return (
    <Card className="card-shadow border-border hover:border-primary/30 transition-all group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-base">
            {user.avatar}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <h3 className="font-display font-semibold text-sm mb-0.5">{user.name}</h3>
        <p className="text-xs text-muted-foreground mb-3">{user.department}</p>
        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /><span className="truncate">{user.email}</span></div>
          {user.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /><span>{user.phone}</span></div>}
        </div>
        <div className="flex items-center justify-between">
          <Badge className={`border text-xs ${roleColors[user.role]}`}>{user.role}</Badge>
          <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={`text-xs ${user.status === 'active' ? 'bg-success/10 text-success border-success/20 border' : ''}`}>
            {user.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Joined {format(new Date(user.joinDate), 'MMM yyyy')}</p>
      </CardContent>
    </Card>
  );
};

const EmployeesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchDept = deptFilter === 'all' || u.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  const deptNames = [...new Set(mockUsers.map(u => u.department))];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: mockUsers.length, icon: Users, color: 'text-primary' },
          { label: 'Admins', value: mockUsers.filter(u => u.role === 'admin').length, icon: Users, color: 'text-primary' },
          { label: 'Managers', value: mockUsers.filter(u => u.role === 'manager').length, icon: Users, color: 'text-accent' },
          { label: 'Active', value: mockUsers.filter(u => u.status === 'active').length, icon: Users, color: 'text-success' },
        ].map(s => (
          <Card key={s.label} className="card-shadow border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search employees..." className="pl-8 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {deptNames.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground">
          <Plus className="w-3.5 h-3.5" /> Add Employee
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(user => <EmployeeCard key={user.id} user={user} />)}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No employees found</p>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
