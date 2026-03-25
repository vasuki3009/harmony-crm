import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Users, Target, CheckSquare, TrendingUp,
  Building2, Bell, Sun, Moon, LogOut, Menu, ChevronLeft,
  Briefcase, BarChart3, Calendar, UserCheck, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockNotifications as initialNotifications } from '../data/mockData';
import type { Notification } from '../types/crm';
import { format } from 'date-fns';

interface NavItem { label: string; icon: React.ElementType; path: string; roles?: string[]; }

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads', icon: Target, path: '/leads' },
  { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { label: 'Employees', icon: Users, path: '/employees', roles: ['admin', 'manager'] },
  { label: 'Departments', icon: Building2, path: '/departments', roles: ['admin', 'manager'] },
  { label: 'Goals', icon: TrendingUp, path: '/goals' },
  { label: 'Attendance', icon: UserCheck, path: '/attendance' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['admin', 'manager'] },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
];

const notifTypeColors: Record<Notification['type'], string> = {
  lead: 'bg-hot/10 text-hot',
  task: 'bg-primary/10 text-primary',
  approval: 'bg-warning/10 text-warning',
  system: 'bg-muted text-muted-foreground',
};

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const filteredNav = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside className={`sidebar-gradient flex flex-col h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
      <div className="flex items-center gap-3 p-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="text-sidebar-accent-foreground font-display font-bold text-lg truncate">NexusCRM</span>}
        <button onClick={onToggle} className="ml-auto text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-0.5 px-2">
          {filteredNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'bg-sidebar-primary/20 text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sidebar-primary' : ''}`} />
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{user?.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-accent-foreground text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-sidebar-foreground text-xs capitalize truncate">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-sidebar-foreground hover:text-red-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center py-2 text-sidebar-foreground hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

const CRMLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications.filter(n => n.userId === user?.id)
  );
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;
  const pageTitle = navItems.find(n => n.path === location.pathname)?.label || 'NexusCRM';

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="hidden lg:flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      </div>
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-display font-semibold">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notifications popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 text-xs flex items-center justify-center bg-destructive text-destructive-foreground border-0">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={markAllRead}>
                      <Check className="w-3 h-3 mr-1" /> Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold ${notifTypeColors[n.type]}`}>
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markRead(n.id)}>
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-semibold truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.createdAt), 'MMM d, HH:mm')}</p>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground flex-shrink-0" onClick={() => dismiss(n.id)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.avatar}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CRMLayout;
