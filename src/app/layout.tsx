
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

  // After loading, if on an auth page, show it.
  if (isAuthPage) {
    return <>{children}</>;
  }

  // After loading, if not on auth page and no user, the hook will redirect.
  // Show a "Redirecting" message as a fallback.
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  // If we have a user and are not on an auth page, show the app shell.
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster />
    </>
  )
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
