import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, DollarSign, User, Flame, Thermometer, Snowflake, Trash2 } from 'lucide-react';
import type { Lead, LeadStatus } from '@/types/crm';
import { mockUsers } from '@/data/mockData';
import { format } from 'date-fns';

export const temperatureConfig = {
  hot: { icon: Flame, class: 'text-hot bg-hot/10 border-hot/20', label: 'Hot' },
  warm: { icon: Thermometer, class: 'text-warm bg-warm/10 border-warm/20', label: 'Warm' },
  cold: { icon: Snowflake, class: 'text-cold bg-cold/10 border-cold/20', label: 'Cold' },
};

export const statusColors: Record<LeadStatus, string> = {
  new: 'bg-muted text-muted-foreground',
  contacted: 'bg-cold/10 text-cold',
  qualified: 'bg-warning/10 text-warning',
  converted: 'bg-success/10 text-success',
  lost: 'bg-destructive/10 text-destructive',
};

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onDelete, isDeleting }) => {
  const temp = temperatureConfig[lead.temperature];
  const TempIcon = temp.icon;
  const assignedUser = mockUsers.find(u => u.id === lead.assignedTo);

  return (
    <div
      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2 gap-1">
        <h4 className="text-sm font-semibold leading-tight flex-1 group-hover:text-primary transition-colors">
          {lead.name}
        </h4>
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
        <span className="text-muted-foreground">
          Score: <span className="font-semibold text-foreground">{lead.score}</span>
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{assignedUser?.name?.split(' ')[0] || '—'}</span>
        </div>
        <div className="flex items-center gap-1">
          {lead.lastContact && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(lead.lastContact), 'MMM d')}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            disabled={isDeleting}
            onClick={e => { e.stopPropagation(); onDelete(lead.id); }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
