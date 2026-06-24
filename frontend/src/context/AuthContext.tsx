'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, loginUser, logoutUser } from '../app/actions/authActions';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    setLoading(true);
    try {
      let currentUser = await getCurrentUser();
      if (!currentUser) {
        const res = await loginUser({ email: 'mentor@example.com', password: 'password123' });
        if (res.success) {
          currentUser = await getCurrentUser();
        }
      }
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    await refreshUser(); // Auto logs back in
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
