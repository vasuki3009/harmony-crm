import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Users, Target, CheckSquare, TrendingUp,
  Building2, Bell, Sun, Moon, LogOut, Menu, X, ChevronLeft,
  Briefcase, BarChart3, Calendar, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockNotifications } from '../data/mockData';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: string[];
}

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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNav = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className={`sidebar-gradient flex flex-col h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sidebar-accent-foreground font-display font-bold text-lg truncate">NexusCRM</span>
        )}
        <button onClick={onToggle} className="ml-auto text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-0.5 px-2">
          {filteredNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-sidebar-primary/20 text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sidebar-primary' : ''}`} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.avatar}
            </div>
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
  const location = useLocation();

  const unreadCount = mockNotifications.filter(n => !n.read && n.userId === user?.id).length;

  const pageTitle = navItems.find(n => n.path === location.pathname)?.label || 'NexusCRM';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — desktop */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      </div>

      {/* Sidebar — mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
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
            <Button variant="ghost" size="icon" className="w-9 h-9 relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 text-xs flex items-center justify-center bg-destructive text-destructive-foreground">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.avatar}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CRMLayout;
