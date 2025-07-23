
'use client'

import * as React from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { DataRefreshProvider } from '@/hooks/use-data-refresh';


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
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) {
      return; // Do nothing while loading.
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    
    // If we have a user and they are on an auth page, redirect to home.
    if (user && isAuthPage) {
      router.push('/');
    }
    
    // If we have no user and they are on a protected page, redirect to login.
    if (!user && !isAuthPage) {
      router.push('/login');
    }

  }, [user, isLoading, pathname, router]);


  // While loading, show a global loading screen.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If there's a user, show the app.
  if (user) {
    return (
        <>
        <AppShell>{children}</AppShell>
        <Toaster />
        </>
    );
  }

  // If there's no user, but we are on an auth page, show the auth page.
  if (!user && isAuthPage) {
    return <>{children}</>;
  }

  // Fallback for edge cases, though the useEffect should handle redirection.
  return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting...</div>
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
          <DataRefreshProvider>
            <AppContent>{children}</AppContent>
          </DataRefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
