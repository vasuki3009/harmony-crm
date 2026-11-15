import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { mockUsers as initialUsers, mockDepartments } from '../data/mockData';
import type { User, UserRole } from '../types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Users, Plus, Search, Mail, Phone, Edit, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const roleColors: Record<UserRole, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  manager: 'bg-accent/10 text-accent border-accent/20',
  employee: 'bg-warning/10 text-warning border-warning/20',
};

type EmployeeFormValues = {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: UserRole;
  status: 'active' | 'inactive';
};

const EmployeeModal: React.FC<{
  open: boolean;
  editing: User | null;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues, id?: string) => Promise<void>;
}> = ({ open, editing, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const deptNames = [...new Set(initialUsers.map(u => u.department))];

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<EmployeeFormValues>({
    defaultValues: editing
      ? { name: editing.name, email: editing.email, phone: editing.phone ?? '', department: editing.department, role: editing.role, status: editing.status }
      : { role: 'employee', status: 'active', department: deptNames[0] ?? '' },
  });

  React.useEffect(() => {
    if (editing) {
      reset({ name: editing.name, email: editing.email, phone: editing.phone ?? '', department: editing.department, role: editing.role, status: editing.status });
    } else {
      reset({ role: 'employee', status: 'active', department: deptNames[0] ?? '' });
    }
  }, [editing, open]);

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    try { await onSubmit(values, editing?.id); onClose(); }
    finally { setLoading(false); }
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Full Name *</Label>
              <Input {...register('name', { required: 'Name is required' })} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" {...register('email', { required: 'Email required' })} placeholder="john@company.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...register('phone')} placeholder="+1 555-0000" />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select defaultValue={editing?.department ?? deptNames[0]} onValueChange={v => setValue('department', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {deptNames.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select defaultValue={editing?.role ?? 'employee'} onValueChange={v => setValue('role', v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue={editing?.status ?? 'active'} onValueChange={v => setValue('status', v as 'active' | 'inactive')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{editing ? 'Saving…' : 'Adding…'}</> : editing ? 'Save Changes' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EmployeesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchDept = deptFilter === 'all' || u.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  const deptNames = [...new Set(users.map(u => u.department))];

  const handleSubmit = useCallback(async (data: EmployeeFormValues, id?: string) => {
    await new Promise(r => setTimeout(r, 350));
    if (id) {
      setUsers(prev => prev.map(u => u.id === id
        ? { ...u, ...data, avatar: data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
        : u
      ));
      toast({ title: '✅ Employee updated', description: `${data.name} updated.` });
    } else {
      const newUser: User = {
        id: `u${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        role: data.role,
        status: data.status,
        avatar: data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        joinDate: new Date().toISOString().split('T')[0],
      };
      setUsers(prev => [newUser, ...prev]);
      toast({ title: '✅ Employee added', description: `${data.name} has been added.` });
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 300));
    setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    toast({ title: '🗑 Employee removed', description: `${deleteTarget.name} removed.` });
    setDeleteTarget(null);
    setDeleting(false);
  }, [deleteTarget]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: users.length },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length },
          { label: 'Managers', value: users.filter(u => u.role === 'manager').length },
          { label: 'Active', value: users.filter(u => u.status === 'active').length },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 card-shadow">
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search employees…" className="pl-8 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {deptNames.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="w-3.5 h-3.5" /> Add Employee
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(user => (
          <Card key={user.id} className="card-shadow border-border hover:border-primary/30 transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-base">
                  {user.avatar}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => { setEditing(user); setModalOpen(true); }}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(user)}>
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
                <Badge className={`text-xs border ${user.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {user.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Joined {format(new Date(user.joinDate), 'MMM yyyy')}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No employees found</p>
        </div>
      )}

      <EmployeeModal
        open={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.name} from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Deleting…</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeesPage;
