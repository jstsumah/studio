
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '@/lib/firebase';
import type { Employee } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
  user: Employee | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, pass: string) => Promise<string | null>;
  signup: (name: string, email: string, pass: string) => Promise<string | null>;
  logout: () => void;
  updateUser: (data: Partial<Omit<Employee, 'id' | 'email'>>) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isFirebaseError(error: unknown): error is { code: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        const userDocRef = doc(db, 'employees', fbUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as Employee;
            if (userData.active) {
              setUser(userData);
              setFirebaseUser(fbUser);
            } else {
              // User is not active, sign them out and clear state
              await signOut(auth);
              setUser(null);
              setFirebaseUser(null);
            }
          } else {
            // User document doesn't exist, sign them out and clear state
            await signOut(auth);
            setUser(null);
            setFirebaseUser(null);
          }
        } catch (error) {
           // Error fetching doc, sign out and clear state
           console.error("Error fetching user document:", error);
           await signOut(auth);
           setUser(null);
           setFirebaseUser(null);
        }
      } else {
        // No firebase user, clear state
        setUser(null);
        setFirebaseUser(null);
      }
      // Only set loading to false after all async operations are done
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<string | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;

        // After successful auth, check Firestore for the user document and status
        const userDocRef = doc(db, 'employees', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await signOut(auth);
            return 'auth/user-not-found';
        }

        const userData = { id: userDoc.id, ...userDoc.data() } as Employee;

        if (!userData.active) {
            await signOut(auth);
            return 'auth/user-not-active';
        }
        
        // If user is active, set the user state.
        // The onAuthStateChanged listener will also fire but this ensures
        // the UI updates immediately on login.
        setUser(userData);
        setFirebaseUser(fbUser);
        return null;

    } catch (error) {
        if (isFirebaseError(error)) {
            return error.code;
        }
        console.error("Unknown login error:", error);
        return 'auth/unknown-error';
    }
  };

  const signup = async (name: string, email: string, pass: string): Promise<string | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      const newEmployeeData: Omit<Employee, 'id'> = {
        name,
        email,
        department: 'Unassigned',
        jobTitle: 'New Employee',
        avatarUrl: '',
        role: 'Employee',
        active: false, 
      };
      
      await setDoc(doc(db, 'employees', newUser.uid), newEmployeeData);
      
      toast({
        title: 'Account Created!',
        description: 'Your account is now pending activation by an administrator.',
        duration: 9000,
      });

      await signOut(auth);
      router.push('/login');
      return null;
    } catch (error) {
      if (isFirebaseError(error)) {
        return error.code;
      }
      console.error("Unknown signup error:", error)
      return 'auth/unknown-error';
    }
  }

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (data: Partial<Omit<Employee, 'id' | 'email'>>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile.',
        variant: 'destructive',
      });
      return;
    }

    const userDocRef = doc(db, 'employees', user.id);
    
    try {
      await updateDoc(userDocRef, data);
      setUser(prevUser => prevUser ? { ...prevUser, ...data } as Employee : null);
      toast({
        title: 'Profile Updated!',
        description: 'Your information has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, signup, logout, updateUser, isLoading, isAdmin }}>
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
