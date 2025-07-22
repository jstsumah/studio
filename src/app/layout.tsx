import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: 'AssetWise',
  description: 'Asset Tracking System for a Company',
};

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'font-body antialiased',
          fontInter.variable,
          fontSpaceGrotesk.variable
        )}
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
