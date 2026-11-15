import React, { useEffect, useState, useCallback } from 'react';
import { leadsApi } from '../services/leadsApi';
import type { Lead, LeadStatus } from '../types/crm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LeadCard, { temperatureConfig, statusColors } from '@/components/leads/LeadCard';
import LeadDetail from '@/components/leads/LeadDetail';
import AddLeadModal from '@/components/leads/AddLeadModal';
import FilterPanel, { LeadFilters, DEFAULT_FILTERS } from '@/components/leads/FilterPanel';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'border-t-muted-foreground' },
  { id: 'contacted', label: 'Contacted', color: 'border-t-cold' },
  { id: 'qualified', label: 'Qualified', color: 'border-t-warning' },
  { id: 'converted', label: 'Converted', color: 'border-t-success' },
  { id: 'lost', label: 'Lost', color: 'border-t-destructive' },
];

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dragLead, setDragLead] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Fetch all leads ────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load leads';
      setError(msg);
      toast({ title: 'Error loading leads', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Create lead ────────────────────────────────────────────────────────────
  const handleCreate = async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead = await leadsApi.create(data);
    setLeads(prev => [newLead, ...prev]);
    toast({ title: '✅ Lead created', description: `${newLead.name} added to pipeline.` });
  };

  // ── Delete lead ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await leadsApi.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
      toast({ title: '🗑 Lead removed', description: 'Lead deleted successfully.' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Update status (drag-drop) ──────────────────────────────────────────────
  const handleDrop = async (status: LeadStatus) => {
    if (!dragLead || updatingId) return;
    const lead = leads.find(l => l.id === dragLead);
    if (!lead || lead.status === status) { setDragLead(null); return; }
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === dragLead ? { ...l, status } : l));
    setDragLead(null);
    setUpdatingId(dragLead);
    try {
      const updated = await leadsApi.updateStatus(dragLead, status);
      setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
      toast({ title: 'Status updated', description: `${lead.name} → ${status}` });
    } catch (e) {
      // Rollback
      setLeads(prev => prev.map(l => l.id === dragLead ? { ...l, status: lead.status } : l));
      const msg = e instanceof Error ? e.message : 'Update failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Derived / filtered data ────────────────────────────────────────────────
  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    if (q && !l.name.toLowerCase().includes(q) && !l.company.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q)) return false;
    if (filters.status !== 'all' && l.status !== filters.status) return false;
    if (filters.temperature !== 'all' && l.temperature !== filters.temperature) return false;
    if (filters.assignedTo !== 'all' && l.assignedTo !== filters.assignedTo) return false;
    if (l.value < filters.minValue) return false;
    return true;
  });

  const getColumnLeads = (status: LeadStatus) => filtered.filter(l => l.status === status);

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading leads…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-destructive font-medium">{error}</p>
        <Button size="sm" onClick={fetchLeads}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search leads…"
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter panel */}
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />

          {/* Kanban / List toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              className={`px-3 h-9 text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
              onClick={() => setView('kanban')}
            >
              Kanban
            </button>
            <button
              className={`px-3 h-9 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
        </div>

        <Button
          size="sm"
          className="h-9 gap-1.5 gradient-primary text-primary-foreground"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" /> Add Lead
        </Button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Hot', count: leads.filter(l => l.temperature === 'hot').length, cls: 'bg-hot/10 text-hot border-hot/20' },
          { label: 'Warm', count: leads.filter(l => l.temperature === 'warm').length, cls: 'bg-warm/10 text-warm border-warm/20' },
          { label: 'Cold', count: leads.filter(l => l.temperature === 'cold').length, cls: 'bg-cold/10 text-cold border-cold/20' },
        ].map(b => (
          <Badge key={b.label} className={`border px-3 py-1 text-xs ${b.cls}`}>{b.label}: {b.count}</Badge>
        ))}
        {filtered.length !== leads.length && (
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            Showing {filtered.length} of {leads.length}
          </Badge>
        )}
      </div>

      {/* ── Kanban Board ── */}
      {view === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className={`flex-shrink-0 w-60 bg-secondary/40 rounded-2xl p-3 border-t-4 ${col.color} min-h-96 transition-colors ${dragLead ? 'border-dashed' : ''}`}
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
                    className={updatingId === lead.id ? 'opacity-60 pointer-events-none' : ''}
                  >
                    <LeadCard
                      lead={lead}
                      onClick={() => setSelectedLead(lead)}
                      onDelete={handleDelete}
                      isDeleting={deletingId === lead.id}
                    />
                  </div>
                ))}
                {getColumnLeads(col.id).length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    {dragLead ? 'Drop here' : 'No leads'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List View ── */
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No leads match your filters.
            </div>
          ) : filtered.map(lead => {
            const temp = temperatureConfig[lead.temperature];
            const TempIcon = temp.icon;
            return (
              <div
                key={lead.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  {lead.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.company} • {lead.email}</p>
                </div>
                <Badge className={`border ${temp.class} text-xs hidden sm:flex`}>
                  <TempIcon className="w-2.5 h-2.5 mr-0.5" />{temp.label}
                </Badge>
                <Badge className={`border-0 text-xs hidden sm:flex ${statusColors[lead.status]}`}>{lead.status}</Badge>
                <span className="text-sm font-bold text-success hidden md:block">${(lead.value / 1000).toFixed(0)}K</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive"
                  disabled={deletingId === lead.id}
                  onClick={e => { e.stopPropagation(); handleDelete(lead.id); }}
                >
                  {deletingId === lead.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:hidden" />
                  }
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Lead detail dialog */}
      <Dialog open={!!selectedLead} onOpenChange={v => { if (!v) setSelectedLead(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="sr-only">Lead Detail</DialogTitle>
          </DialogHeader>
          {selectedLead && <LeadDetail lead={selectedLead} />}
        </DialogContent>
      </Dialog>

      {/* Add Lead modal */}
      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default LeadsPage;
