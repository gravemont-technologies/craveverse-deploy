// Root layout for the application
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
// import { PerformanceMonitor } from '@/components/performance-monitor';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Force all pages to be dynamic - prevents static generation during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CraveVerse - Conquer Your Cravings',
  description: 'Transform your life by conquering your cravings with our 30-day journey system.',
  keywords: ['addiction recovery', 'habit breaking', 'self improvement', 'craving control'],
  authors: [{ name: 'CraveVerse Team' }],
  openGraph: {
    title: 'CraveVerse - Conquer Your Cravings',
    description: 'Transform your life by conquering your cravings with our 30-day journey system.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CraveVerse - Conquer Your Cravings',
    description: 'Transform your life by conquering your cravings with our 30-day journey system.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we're in build phase - skip Clerk entirely during build
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  
  // Check if we have a valid Clerk publishable key
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidClerkKey = clerkPubKey && 
    clerkPubKey.startsWith('pk_') && 
    !clerkPubKey.includes('placeholder') &&
    clerkPubKey.length > 50; // Real Clerk keys are much longer

  // Skip Clerk during build time OR if we don't have a valid key
  if (isBuildTime || !isValidClerkKey) {
    return (
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" />
          {/* <PerformanceMonitor /> */}
        </body>
      </html>
    );
  }

  // Runtime with valid key: use ClerkProvider for full auth functionality
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" />
          {/* <PerformanceMonitor /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
