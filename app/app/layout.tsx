
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shopify Inventory Dashboard',
  description: 'Real-time inventory tracking for your Shopify store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          'min-h-screen bg-gradient-to-br from-background via-background to-muted/20 font-sans antialiased',
          inter.className
        )}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
