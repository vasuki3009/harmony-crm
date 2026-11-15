import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Building, DollarSign, Clock, User, ChevronRight } from 'lucide-react';
import type { Lead, LeadStatus } from '@/types/crm';
import { mockUsers, mockLeadActivities } from '@/data/mockData';
import { temperatureConfig, statusColors } from './LeadCard';
import { format } from 'date-fns';

interface LeadDetailProps {
  lead: Lead;
}

const activityIcons = {
  call: Phone,
  email: Mail,
  note: User,
  status_change: ChevronRight,
  task: Clock,
};

const LeadDetail: React.FC<LeadDetailProps> = ({ lead }) => {
  const activities = mockLeadActivities.filter(a => a.leadId === lead.id);
  const assignedUser = mockUsers.find(u => u.id === lead.assignedTo);
  const temp = temperatureConfig[lead.temperature];
  const TempIcon = temp.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-display font-bold">{lead.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
            <Building className="w-3.5 h-3.5" /> {lead.company}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={`border ${temp.class}`}>
            <TempIcon className="w-3 h-3 mr-1" />{temp.label}
          </Badge>
          <Badge className={`border-0 ${statusColors[lead.status]}`}>{lead.status}</Badge>
        </div>
      </div>

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

      {lead.notes && (
        <div className="bg-secondary/40 rounded-xl p-3 text-sm">
          <p className="font-medium text-xs text-muted-foreground mb-1">Notes</p>
          <p>{lead.notes}</p>
        </div>
      )}

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

export default LeadDetail;
