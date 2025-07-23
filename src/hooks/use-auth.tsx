
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '@/lib/firebase';
import type { Employee } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
  user: Employee | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Omit<Employee, 'id'>>, newAvatarUrl?: string | null) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // If user is already loaded, no need to fetch again.
        if (fbUser.uid === user?.id) {
          setIsLoading(false);
          return;
        }
        
        const userDocRef = doc(db, 'employees', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as Employee;
          if (userData.active) {
            setUser(userData);
            setFirebaseUser(fbUser);
          } else {
            toast({
                title: 'Account Pending Activation',
                description: 'Your account has been created but must be activated by an administrator before you can log in.',
                variant: 'destructive',
                duration: 9000
            });
            await signOut(auth); // Sign out user if they are not active
            setUser(null);
            setFirebaseUser(null);
          }
        } else {
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

    return () => unsubscribe();
  }, [pathname, user, toast]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (name: string, email: string, pass: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      const newEmployeeData: Omit<Employee, 'id'> = {
        name,
        email,
        department: 'Unassigned',
        jobTitle: 'New Employee',
        avatarUrl: '',
        role: 'Employee', // New users are always 'Employee'
        active: false, // New users are inactive by default
      };
      
      await setDoc(doc(db, 'employees', newUser.uid), newEmployeeData);
      
      toast({
        title: 'Account Created!',
        description: 'Your account is now pending activation by an administrator.',
        duration: 9000,
      });

      await signOut(auth); // Sign out the user immediately after signup
      router.push('/login');
  }

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const updateUser = async (data: Partial<Omit<Employee, 'id'>>, newAvatarUrl?: string | null) => {
    if (user) {
        const userDocRef = doc(db, 'employees', user.id);
        const updateData = { ...data };

        if (newAvatarUrl) {
            if (newAvatarUrl.startsWith('data:')) {
                const storageRef = ref(storage, `avatars/${user.id}`);
                try {
                    await uploadString(storageRef, newAvatarUrl, 'data_url');
                    const downloadURL = await getDownloadURL(storageRef);
                    updateData.avatarUrl = downloadURL;
                } catch (error) {
                    console.error("Error uploading avatar:", error);
                    toast({
                        title: 'Avatar Upload Failed',
                        description: 'Could not upload your new profile picture. Please try again.',
                        variant: 'destructive',
                    });
                    return; 
                }
            } else {
                updateData.avatarUrl = newAvatarUrl;
            }
        }

      await updateDoc(userDocRef, updateData);
      setUser(prevUser => prevUser ? { ...prevUser, ...updateData } : null);
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
