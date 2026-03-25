import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Lead, LeadStatus, LeadTemperature } from '@/types/crm';
import { mockUsers } from '@/data/mockData';
import { Loader2 } from 'lucide-react';

type FormValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  value: number;
  source: string;
  notes: string;
  status: LeadStatus;
  temperature: LeadTemperature;
  assignedTo: string;
};

const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Trade Show', 'Cold Email', 'Event', 'Other'];

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ open, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      status: 'new',
      temperature: 'cold',
      source: 'Website',
      assignedTo: mockUsers[0]?.id ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await onSubmit({
        ...values,
        score: values.temperature === 'hot' ? 80 : values.temperature === 'warm' ? 50 : 25,
        tags: [],
      });
      reset();
      onClose();
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Lead / Contact Name *</Label>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g. TechCorp Solutions"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="contact@company.com"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...register('phone')} placeholder="+1 555-0000" />
            </div>

            <div className="space-y-1.5">
              <Label>Company *</Label>
              <Input
                {...register('company', { required: 'Company is required' })}
                placeholder="Company name"
              />
              {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Deal Value ($)</Label>
              <Input
                type="number"
                min={0}
                {...register('value', { valueAsNumber: true, min: 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select defaultValue="Website" onValueChange={v => setValue('source', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Temperature</Label>
              <Select defaultValue="cold" onValueChange={v => setValue('temperature', v as LeadTemperature)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="warm">🌡 Warm</SelectItem>
                  <SelectItem value="cold">❄️ Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue="new" onValueChange={v => setValue('status', v as LeadStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Assign To</Label>
              <Select defaultValue={mockUsers[0]?.id} onValueChange={v => setValue('assignedTo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label>Notes</Label>
              <Textarea {...register('notes')} placeholder="Any initial notes about this lead…" rows={3} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Creating…</> : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadModal;
