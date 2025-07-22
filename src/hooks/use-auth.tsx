
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
      // If user logs out, we know immediately and can stop loading.
      if (!fbUser) {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserDoc = async (fbUser: FirebaseUser) => {
      const userDocRef = doc(db, 'employees', fbUser.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as Employee);
        } else {
          console.error("User document not found, signing out.");
          await signOut(auth); // This will trigger the onAuthStateChanged listener
        }
      } catch (error) {
        console.error("Failed to fetch user document:", error);
        await signOut(auth);
      } finally {
        setIsLoading(false);
      }
    };

    if (firebaseUser) {
      fetchUserDoc(firebaseUser);
    }
    // If firebaseUser is null, the onAuthStateChanged listener has already set isLoading to false.
  }, [firebaseUser]);


  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (user && isAuthPage) {
      router.push('/');
    }
    
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
