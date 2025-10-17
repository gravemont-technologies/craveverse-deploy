import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AnalyticsProvider } from '@/lib/analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CraveVerse - Build Meaningful Relationships with AI',
  description: 'Transform how you approach relationships with AI-driven behavioral insights, data visualization, and actionable guidance for personal, professional, and social connections.',
  keywords: ['relationships', 'AI', 'behavioral insights', 'personal development', 'professional networking'],
  authors: [{ name: 'CraveVerse Team' }],
  creator: 'CraveVerse',
  publisher: 'CraveVerse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://craveverse.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CraveVerse - Build Meaningful Relationships with AI',
    description: 'Transform how you approach relationships with AI-driven behavioral insights and actionable guidance.',
    url: 'https://craveverse.com',
    siteName: 'CraveVerse',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CraveVerse - Build Meaningful Relationships',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CraveVerse - Build Meaningful Relationships with AI',
    description: 'Transform how you approach relationships with AI-driven behavioral insights and actionable guidance.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <AnalyticsProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
