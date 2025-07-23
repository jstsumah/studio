
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
      return; // Wait until the auth state is determined.
    }

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    
    // Redirect to home if a logged-in user is trying to access login/signup.
    if (user && isAuthPage) {
      router.push('/');
    }
    
    // Redirect to login if a non-logged-in user is trying to access a protected page.
    if (!user && !isAuthPage) {
      router.push('/login');
    }

  }, [user, isLoading, pathname, router]);


  // While loading auth state, show a global loading screen.
  // This is safe from hydration errors because `isLoading` is initially true on both server and client.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If there's a user and we're not on an auth page, show the app shell.
  if (user && !isAuthPage) {
    return (
        <>
        <AppShell>{children}</AppShell>
        <Toaster />
        </>
    );
  }

  // If there's no user and we are on an auth page, show the auth page content.
  if (!user && isAuthPage) {
    return <>{children}</>;
  }

  // In all other cases (e.g., waiting for the redirect useEffect to run), show a generic loader.
  // This prevents content from flashing before a redirect occurs.
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
