
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
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && !isAuthPage) {
    // This will be handled by the redirect in the useAuth hook,
    // but as a fallback, we can show a loading or redirecting message.
     return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }


  return (
    <>
      {isAuthenticated ? <AppShell>{children}</AppShell> : children}
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
