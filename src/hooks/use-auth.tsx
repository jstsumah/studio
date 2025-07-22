
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getEmployees } from '@/lib/data';
import type { Employee } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Employee | null;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (data: Partial<Employee>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'assetwise_auth_email';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const allEmployees = getEmployees();

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem(AUTH_STORAGE_KEY);
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      
      if (storedEmail) {
        const loggedInUser = allEmployees.find(e => e.email === storedEmail);
        setUser(loggedInUser || null);
        if (isAuthPage) {
            router.push('/');
        }
      } else {
        setUser(null);
        if (!isAuthPage) {
            router.push('/login');
        }
      }

    } catch (error) {
      console.error("Failed to process auth state", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      if (pathname !== '/login' && pathname !== '/signup') {
          router.push('/login');
      }
    } finally {
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (email: string) => {
    const loggedInUser = allEmployees.find(e => e.email === email);
    if(loggedInUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, email);
        setUser(loggedInUser);
        router.push('/');
    } else {
        // In a real app, you would show an error message.
        // For this demo, we'll log them in with just the email.
        const mockUser: Employee = {
            id: 'temp-id',
            name: email.split('@')[0],
            email,
            department: 'Unknown',
            jobTitle: 'Unknown',
            avatarUrl: ''
        };
        localStorage.setItem(AUTH_STORAGE_KEY, email);
        setUser(mockUser);
        router.push('/');
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  const updateUser = (data: Partial<Employee>) => {
    if (user) {
        // In a real app, you'd send this to an API.
        // For this demo, we just update the user state.
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        // Optional: you could update the mock data source here if you want
        // changes to persist across reloads (but that gets more complex).
        const employeeIndex = allEmployees.findIndex(e => e.id === user.id);
        if(employeeIndex !== -1) {
            allEmployees[employeeIndex] = updatedUser;
        }
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    updateUser,
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
