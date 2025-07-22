'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string | null } | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'assetwise_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const parsedAuth = storedAuth ? JSON.parse(storedAuth) : null;
      setUser(parsedAuth);

      const isAuthPage = pathname === '/login' || pathname === '/signup';
      
      if (!parsedAuth && !isAuthPage) {
        router.push('/login');
      } else if (parsedAuth && isAuthPage) {
        router.push('/');
      }

    } catch (error) {
      console.error("Failed to process auth state", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      if (pathname !== '/login') {
          router.push('/login');
      }
    } finally {
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router]);

  const login = (email: string) => {
    const userData = { email };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
