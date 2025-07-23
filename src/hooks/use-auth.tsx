
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Employee } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
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
      if (fbUser) {
        // This check is crucial on signup. The user state might already be set
        // by the signup function. If so, we don't need to do anything.
        if (fbUser.uid === user?.id) {
          setIsLoading(false);
          return;
        }

        const userDocRef = doc(db, 'employees', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        setFirebaseUser(fbUser);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as Employee);
        } else {
            // This case handles when a user is in auth but their DB doc was deleted.
            // We should not be in here during a normal signup flow anymore.
             if (pathname !== '/signup') {
               console.warn("User document not found for an existing auth user. Signing out.");
               await signOut(auth);
            }
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [pathname, user]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle setting state and routing.
  };

  const signup = async (name: string, email: string, pass: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      const newEmployeeData: Omit<Employee, 'id'> = {
        name,
        email,
        department: 'Unassigned',
        jobTitle: 'New Employee',
        avatarUrl: '', // Start with an empty avatar URL
      };
      
      // Create the user document in Firestore
      await setDoc(doc(db, 'employees', newUser.uid), newEmployeeData);
      
      // Manually set the user state to prevent race conditions.
      // This is the key to fixing the signup loop.
      setUser({ id: newUser.uid, ...newEmployeeData });
      setFirebaseUser(newUser);

      // The app will now redirect to the dashboard.
      router.push('/');
  }

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will set user state to null
    router.push('/login');
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

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, signup, logout, updateUser, isLoading }}>
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
