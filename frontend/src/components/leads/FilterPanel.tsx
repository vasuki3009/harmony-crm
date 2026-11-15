import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';
import type { LeadStatus, LeadTemperature } from '@/types/crm';
import { mockUsers } from '@/data/mockData';

export interface LeadFilters {
  status: LeadStatus | 'all';
  temperature: LeadTemperature | 'all';
  assignedTo: string;
  minValue: number;
}

export const DEFAULT_FILTERS: LeadFilters = {
  status: 'all',
  temperature: 'all',
  assignedTo: 'all',
  minValue: 0,
};

interface FilterPanelProps {
  filters: LeadFilters;
  onChange: (f: LeadFilters) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, onReset }) => {
  const activeCount = [
    filters.status !== 'all',
    filters.temperature !== 'all',
    filters.assignedTo !== 'all',
    filters.minValue > 0,
  ].filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 relative">
          <Filter className="w-3.5 h-3.5" /> Filter
          {activeCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4 p-4" align="start">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Filters</span>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground" onClick={onReset}>
              <X className="w-3 h-3" /> Clear all
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={filters.status} onValueChange={v => onChange({ ...filters, status: v as LeadStatus | 'all' })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Temperature</label>
          <Select value={filters.temperature} onValueChange={v => onChange({ ...filters, temperature: v as LeadTemperature | 'all' })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All temperatures</SelectItem>
              <SelectItem value="hot">🔥 Hot</SelectItem>
              <SelectItem value="warm">🌡 Warm</SelectItem>
              <SelectItem value="cold">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Assigned To</label>
          <Select value={filters.assignedTo} onValueChange={v => onChange({ ...filters, assignedTo: v })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anyone</SelectItem>
              {mockUsers.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Min. Deal Value</label>
            <span className="text-xs font-semibold text-primary">${filters.minValue.toLocaleString()}</span>
          </div>
          <Slider
            min={0} max={100000} step={5000}
            value={[filters.minValue]}
            onValueChange={([v]) => onChange({ ...filters, minValue: v })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPanel;
