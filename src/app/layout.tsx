
'use client'

import * as React from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { AuthProvider, useAuth } from '@/hooks/use-auth';


const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If we are on an auth page, render it. The useAuth hook will redirect if the user is already logged in.
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // If we have a user and are not on an auth page, show the app shell.
  if (user) {
    return (
        <>
        <AppShell>{children}</AppShell>
        <Toaster />
        </>
    );
  }

  // If no user and not on an auth page, the useAuth hook will redirect. Show a fallback message.
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Redirecting to login...</div>
    </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'font-body antialiased',
          fontInter.variable,
          fontSpaceGrotesk.variable
        )}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
