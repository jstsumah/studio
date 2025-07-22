
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Employee } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Employee | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Omit<Employee, 'id'>>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // User is logged in, fetch their data
        const userDocRef = doc(db, 'employees', fbUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as Employee);
          } else {
            // Firestore doc doesn't exist, this is an inconsistent state
            console.error("User document not found for authenticated user.");
            await signOut(auth); // Sign out the user
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user document:", error);
          await signOut(auth);
          setUser(null);
        }
      } else {
        // User is logged out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything while loading
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // If we have a user and they are on an auth page, redirect to home
    if (user && isAuthPage) {
      router.push('/');
    }

    // If we don't have a user and they are not on an auth page, redirect to login
    if (!user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, pathname, isLoading, router]);


  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle the rest
  };

  const signup = async (name: string, email: string, pass:string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      const newEmployee: Omit<Employee, 'id'> = {
        name,
        email,
        department: 'Unassigned',
        jobTitle: 'New Employee',
        avatarUrl: `https://i.pravatar.cc/150?u=${newUser.uid}`,
      }

      await setDoc(doc(db, 'employees', newUser.uid), newEmployee);
      // onAuthStateChanged will set the user state and trigger data fetch
  }

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will clear user state and trigger redirects
  };

  const updateUser = async (data: Partial<Omit<Employee, 'id'>>) => {
    if (user) {
      const userDocRef = doc(db, 'employees', user.id);
      await updateDoc(userDocRef, data);
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
       toast({
        title: 'Profile Updated!',
        description: 'Your information has been successfully updated.',
    });
    } else {
         toast({
            title: 'Error',
            description: 'You must be logged in to update your profile.',
            variant: 'destructive',
        });
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    firebaseUser,
    login,
    signup,
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
