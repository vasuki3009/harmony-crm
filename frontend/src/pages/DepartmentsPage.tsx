import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { mockDepartments as initialDepts, mockUsers } from '../data/mockData';
import type { Department } from '../types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Building2, Users, Plus, ChevronRight, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DEPT_COLORS = [
  'from-primary to-primary-glow',
  'from-accent to-emerald-400',
  'from-warning to-orange-400',
  'from-purple-500 to-purple-400',
  'from-cold to-sky-400',
];

type DeptFormValues = { name: string; description: string; headId: string; };

const DeptModal: React.FC<{
  open: boolean;
  editing: Department | null;
  onClose: () => void;
  onSubmit: (data: DeptFormValues, id?: string) => Promise<void>;
}> = ({ open, editing, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, reset } = useForm<DeptFormValues>({
    defaultValues: editing
      ? { name: editing.name, description: editing.description ?? '', headId: editing.headId }
      : { headId: mockUsers[0]?.id ?? '' },
  });

  React.useEffect(() => {
    if (editing) reset({ name: editing.name, description: editing.description ?? '', headId: editing.headId });
    else reset({ headId: mockUsers[0]?.id ?? '' });
  }, [editing, open]);

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    try { await onSubmit(values, editing?.id); onClose(); }
    finally { setLoading(false); }
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !loading) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'Edit Department' : 'New Department'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Department Name *</Label>
            <Input {...register('name', { required: true })} placeholder="e.g. Engineering" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea {...register('description')} placeholder="Department description…" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Department Head</Label>
            <Select defaultValue={editing?.headId ?? mockUsers[0]?.id} onValueChange={v => setValue('headId', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{editing ? 'Saving…' : 'Creating…'}</> : editing ? 'Save Changes' : 'Create Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(initialDepts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = useCallback(async (data: DeptFormValues, id?: string) => {
    await new Promise(r => setTimeout(r, 350));
    if (id) {
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
      toast({ title: '✅ Department updated' });
    } else {
      const newDept: Department = {
        id: `d${Date.now()}`, name: data.name, description: data.description,
        headId: data.headId, employeeCount: 0, createdAt: new Date().toISOString().split('T')[0],
      };
      setDepartments(prev => [...prev, newDept]);
      toast({ title: '✅ Department created', description: `${data.name} added.` });
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 300));
    setDepartments(prev => prev.filter(d => d.id !== deleteTarget.id));
    toast({ title: '🗑 Department removed' });
    setDeleteTarget(null);
    setDeleting(false);
  }, [deleteTarget]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{departments.length} departments total</p>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="w-3.5 h-3.5" /> New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept, i) => {
          const head = mockUsers.find(u => u.id === dept.headId);
          const employees = mockUsers.filter(u => u.department === dept.name);
          return (
            <Card key={dept.id} className="card-shadow border-border hover:border-primary/30 transition-all group overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${DEPT_COLORS[i % DEPT_COLORS.length]}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${DEPT_COLORS[i % DEPT_COLORS.length]} flex items-center justify-center`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setEditing(dept); setModalOpen(true); }}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(dept)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-display font-bold text-base mb-1">{dept.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{dept.description}</p>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>{employees.length} employees</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {employees.slice(0, 5).map(emp => (
                    <div key={emp.id} title={emp.name} className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold border-2 border-card">
                      {emp.avatar}
                    </div>
                  ))}
                  {employees.length > 5 && (
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
                      +{employees.length - 5}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Head: <span className="font-medium text-foreground">{head?.name || '—'}</span></span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DeptModal open={modalOpen} editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={handleSubmit} />

      <AlertDialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the department. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting} onClick={handleDelete}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Deleting…</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsPage;
