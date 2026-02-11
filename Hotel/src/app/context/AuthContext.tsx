import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          setUser(parsed.user);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        let message = `Login failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore
        }
        console.warn('Login failed', message);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }));
      console.info('Login success', data.user?.email || data.user?.phone || data.user?.id);
      return true;
    } catch (error) {
      console.error('Login error', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (!response.ok) {
        let message = `Signup failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore
        }
        console.warn('Signup failed', message);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }));
      console.info('Signup success', data.user?.email || data.user?.phone || data.user?.id);
      return true;
    } catch (error) {
      console.error('Signup error', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
