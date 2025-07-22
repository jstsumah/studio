
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
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setIsLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser) {
        setIsLoading(true);
        const userDocRef = doc(db, 'employees', firebaseUser.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUser({ id: userDoc.id, ...userDoc.data() } as Employee);
            } else {
                // This case can happen if user is created in Firebase auth but not Firestore
                setUser(null); 
                // Consider logging out the user here if this is an invalid state
                await signOut(auth);
            }
        } catch (error) {
            console.error("Failed to fetch user document:", error);
            setUser(null);
            // Optionally sign out if user data is critical and fetch fails
            await signOut(auth);
        }
        setIsLoading(false);
      } else {
        setUser(null);
      }
    };

    fetchUserData();
  }, [firebaseUser]);

  useEffect(() => {
    // This effect handles routing after the initial loading is complete.
    if (!isLoading) {
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      if (firebaseUser) {
        if (isAuthPage) {
          router.push('/');
        }
      } else {
        if (!isAuthPage) {
          router.push('/login');
        }
      }
    }
  }, [firebaseUser, pathname, isLoading, router]);


  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle the rest
  };

  const signup = async (name: string, email: string, pass: string) => {
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
      // onAuthStateChanged will set the user state
  }

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle the rest
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
    isAuthenticated: !!firebaseUser && !!user,
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
