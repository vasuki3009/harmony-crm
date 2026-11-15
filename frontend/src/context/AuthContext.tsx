import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/crm';
import { mockUsers } from '../data/mockData';
import { apiRequest, isApiEnabled, tokenStore, UNAUTHORIZED_EVENT } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('crm_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // The backend answered 401 (token expired / invalid) -> log the user out.
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Real backend: POST /api/auth/login -> { token, user }
    if (isApiEnabled) {
      try {
        const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        tokenStore.set(res.token);
        setUser(res.user);
        sessionStorage.setItem('crm_user', JSON.stringify(res.user));
        return true;
      } catch {
        return false;
      }
    }

    // Mock mode (no VITE_API_URL): any password works for the demo users.
    const found = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      sessionStorage.setItem('crm_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('crm_user');
    tokenStore.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
