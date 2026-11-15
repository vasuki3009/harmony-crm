import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'alex@nexuscrm.io', color: 'bg-primary' },
  { role: 'Manager', email: 'sarah@nexuscrm.io', color: 'bg-accent' },
  { role: 'Employee', email: 'michael@nexuscrm.io', color: 'bg-warning' },
];

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex@nexuscrm.io');
  const [password, setPassword] = useState('password');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Invalid credentials. Use a demo account below.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-sidebar-accent-foreground">NexusCRM</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-sidebar-accent-foreground leading-tight mb-4">
            Manage your pipeline<br />with intelligence
          </h1>
          <p className="text-sidebar-foreground text-lg leading-relaxed">
            Enterprise-grade CRM for high-performance sales teams. Track leads, close deals, and hit targets.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { title: '2,400+ Active Users', desc: 'Trusted by leading enterprises worldwide' },
            { title: '98% Lead Accuracy', desc: 'AI-powered lead scoring system' },
            { title: '3× Faster Closure', desc: 'Automated workflows reduce manual work' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 bg-sidebar-accent rounded-xl p-4">
              <div className="w-2 h-2 rounded-full bg-sidebar-primary flex-shrink-0" />
              <div>
                <div className="text-sidebar-accent-foreground font-semibold text-sm">{item.title}</div>
                <div className="text-sidebar-foreground text-xs">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10" />
        <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-accent/10" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">NexusCRM</span>
          </div>

          <h2 className="text-3xl font-display font-bold mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your workspace</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-11 pr-10"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground font-medium gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-3 text-center">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  onClick={() => { setEmail(acc.email); setPassword('password'); }}
                >
                  <div className={`w-8 h-8 rounded-lg ${acc.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {acc.role[0]}
                  </div>
                  <span className="text-xs font-medium group-hover:text-primary transition-colors">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
