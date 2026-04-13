'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RushUser } from '@/lib/rush-user';

interface AuthContextType {
  user: RushUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RushUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('rush_token');
      if (savedToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json() as RushUser;
            setUser(userData);
            setToken(savedToken);
          } else {
            localStorage.removeItem('rush_token');
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('rush_token');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json() as { user: RushUser; token: string };
    const { user: newUser, token: newToken } = data;

    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('rush_token', newToken);
  };

  const register = async (email: string, name: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json() as { user: RushUser; token: string };
    const { user: newUser, token: newToken } = data;

    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('rush_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rush_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
