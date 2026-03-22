import React, { useState } from 'react';
import { mockLeads, mockLeadActivities, mockUsers } from '../data/mockData';
import type { Lead, LeadStatus, LeadTemperature } from '../types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, Filter, Flame, Thermometer, Snowflake,
  Phone, Mail, Building, DollarSign, Clock, User, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'border-t-muted-foreground' },
  { id: 'contacted', label: 'Contacted', color: 'border-t-cold' },
  { id: 'qualified', label: 'Qualified', color: 'border-t-warning' },
  { id: 'converted', label: 'Converted', color: 'border-t-success' },
  { id: 'lost', label: 'Lost', color: 'border-t-destructive' },
];

const temperatureConfig = {
  hot: { icon: Flame, class: 'text-hot bg-hot/10 border-hot/20', label: 'Hot' },
  warm: { icon: Thermometer, class: 'text-warm bg-warm/10 border-warm/20', label: 'Warm' },
  cold: { icon: Snowflake, class: 'text-cold bg-cold/10 border-cold/20', label: 'Cold' },
};

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-muted text-muted-foreground',
  contacted: 'bg-cold/10 text-cold',
  qualified: 'bg-warning/10 text-warning',
  converted: 'bg-success/10 text-success',
  lost: 'bg-destructive/10 text-destructive',
};

const LeadCard: React.FC<{ lead: Lead; onClick: () => void }> = ({ lead, onClick }) => {
  const temp = temperatureConfig[lead.temperature];
  const TempIcon = temp.icon;
  const assignedUser = mockUsers.find(u => u.id === lead.assignedTo);

  return (
    <div
      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2 gap-1">
        <h4 className="text-sm font-semibold leading-tight flex-1 group-hover:text-primary transition-colors">{lead.name}</h4>
        <Badge className={`text-xs px-1.5 py-0 border ${temp.class} flex-shrink-0`}>
          <TempIcon className="w-2.5 h-2.5 mr-0.5" /> {temp.label}
        </Badge>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Building className="w-3 h-3" /> {lead.company}
      </div>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="flex items-center gap-1 font-bold text-success">
          <DollarSign className="w-3 h-3" /> {(lead.value / 1000).toFixed(0)}K
        </span>
        <span className="text-muted-foreground">Score: <span className="font-semibold text-foreground">{lead.score}</span></span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{assignedUser?.name?.split(' ')[0] || '—'}</span>
        </div>
        {lead.lastContact && (
          <span className="text-xs text-muted-foreground">{format(new Date(lead.lastContact), 'MMM d')}</span>
        )}
      </div>
    </div>
  );
};

const LeadDetail: React.FC<{ lead: Lead; onClose: () => void }> = ({ lead, onClose }) => {
  const activities = mockLeadActivities.filter(a => a.leadId === lead.id);
  const assignedUser = mockUsers.find(u => u.id === lead.assignedTo);
  const temp = temperatureConfig[lead.temperature];
  const TempIcon = temp.icon;

  const activityIcons = { call: Phone, email: Mail, note: User, status_change: ChevronRight, task: Clock };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-display font-bold">{lead.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
            <Building className="w-3.5 h-3.5" /> {lead.company}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={`border ${temp.class}`}><TempIcon className="w-3 h-3 mr-1" />{temp.label}</Badge>
          <Badge className={`border-0 ${statusColors[lead.status]}`}>{lead.status}</Badge>
        </div>
      </div>

      {/* Lead score bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium">Lead Score</span>
          <span className="font-bold text-primary">{lead.score}/100</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${lead.score >= 80 ? 'bg-hot' : lead.score >= 50 ? 'bg-warm' : 'bg-cold'}`}
            style={{ width: `${lead.score}%` }}
          />
        </div>
      </div>

      {/* Contact info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { icon: Mail, label: 'Email', value: lead.email },
          { icon: Phone, label: 'Phone', value: lead.phone },
          { icon: DollarSign, label: 'Deal Value', value: `$${lead.value.toLocaleString()}` },
          { icon: User, label: 'Assigned To', value: assignedUser?.name || '—' },
        ].map(item => (
          <div key={item.label} className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <item.icon className="w-3 h-3" /> {item.label}
            </div>
            <p className="font-medium text-sm truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      {lead.notes && (
        <div className="bg-secondary/40 rounded-xl p-3 text-sm">
          <p className="font-medium text-xs text-muted-foreground mb-1">Notes</p>
          <p>{lead.notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Activity Timeline</h4>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3 relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
            {activities.map(activity => {
              const IconComp = activityIcons[activity.type] || Clock;
              const performer = mockUsers.find(u => u.id === activity.performedBy);
              return (
                <div key={activity.id} className="flex gap-3 relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 z-10">
                    <IconComp className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-xl p-3 text-sm">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {performer?.name} • {format(new Date(activity.createdAt), 'MMM d, HH:mm')}
                    </p>
                    <p>{activity.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {lead.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

const LeadsPage: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [dragLead, setDragLead] = useState<string | null>(null);

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  const getColumnLeads = (status: LeadStatus) => filtered.filter(l => l.status === status);

  const handleDrop = (status: LeadStatus) => {
    if (!dragLead) return;
    setLeads(prev => prev.map(l => l.id === dragLead ? { ...l, status } : l));
    setDragLead(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search leads..." className="pl-8 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5"><Filter className="w-3.5 h-3.5" /> Filter</Button>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button className={`px-3 h-9 text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`} onClick={() => setView('kanban')}>Kanban</button>
            <button className={`px-3 h-9 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`} onClick={() => setView('list')}>List</button>
          </div>
        </div>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground">
          <Plus className="w-3.5 h-3.5" /> Add Lead
        </Button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Hot', count: leads.filter(l => l.temperature === 'hot').length, class: 'bg-hot/10 text-hot border-hot/20' },
          { label: 'Warm', count: leads.filter(l => l.temperature === 'warm').length, class: 'bg-warm/10 text-warm border-warm/20' },
          { label: 'Cold', count: leads.filter(l => l.temperature === 'cold').length, class: 'bg-cold/10 text-cold border-cold/20' },
        ].map(b => (
          <Badge key={b.label} className={`border px-3 py-1 text-xs ${b.class}`}>{b.label}: {b.count}</Badge>
        ))}
      </div>

      {view === 'kanban' ? (
        /* Kanban Board */
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className={`flex-shrink-0 w-60 bg-secondary/40 rounded-2xl p-3 border-t-4 ${col.color} min-h-96`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge variant="secondary" className="text-xs">{getColumnLeads(col.id).length}</Badge>
              </div>
              <div className="space-y-2">
                {getColumnLeads(col.id).map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragLead(lead.id)}
                    onDragEnd={() => setDragLead(null)}
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <div onClick={() => setSelectedLead(lead)}>
                          <LeadCard lead={lead} onClick={() => setSelectedLead(lead)} />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
                        <DialogHeader>
                          <DialogTitle className="sr-only">Lead Detail</DialogTitle>
                        </DialogHeader>
                        {selectedLead?.id === lead.id && <LeadDetail lead={lead} onClose={() => setSelectedLead(null)} />}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
                {getColumnLeads(col.id).length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {filtered.map(lead => {
            const temp = temperatureConfig[lead.temperature];
            const TempIcon = temp.icon;
            return (
              <Dialog key={lead.id}>
                <DialogTrigger asChild>
                  <div
                    className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.company} • {lead.email}</p>
                    </div>
                    <Badge className={`border ${temp.class} text-xs hidden sm:flex`}><TempIcon className="w-2.5 h-2.5 mr-0.5" />{temp.label}</Badge>
                    <Badge className={`border-0 text-xs hidden sm:flex ${statusColors[lead.status]}`}>{lead.status}</Badge>
                    <span className="text-sm font-bold text-success hidden md:block">${(lead.value / 1000).toFixed(0)}K</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
                  <DialogHeader>
                    <DialogTitle className="sr-only">Lead Detail</DialogTitle>
                  </DialogHeader>
                  {selectedLead?.id === lead.id && <LeadDetail lead={lead} onClose={() => setSelectedLead(null)} />}
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
