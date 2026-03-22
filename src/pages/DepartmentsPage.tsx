import React, { useState } from 'react';
import { mockDepartments, mockUsers } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Plus, ChevronRight, Edit } from 'lucide-react';

const DEPT_COLORS = [
  'from-primary to-primary-glow',
  'from-accent to-emerald-400',
  'from-warning to-orange-400',
  'from-purple-500 to-purple-400',
  'from-cold to-sky-400',
];

const DepartmentsPage: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{mockDepartments.length} departments total</p>
        <Button size="sm" className="h-9 gap-1.5 gradient-primary text-primary-foreground">
          <Plus className="w-3.5 h-3.5" /> New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDepartments.map((dept, i) => {
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
                  <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <h3 className="font-display font-bold text-base mb-1">{dept.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{dept.description}</p>

                <div className="flex items-center justify-between mb-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{employees.length} employees</span>
                  </div>
                </div>

                {/* Employee avatars */}
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
                  <div className="text-muted-foreground">
                    Head: <span className="font-medium text-foreground">{head?.name || '—'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentsPage;
