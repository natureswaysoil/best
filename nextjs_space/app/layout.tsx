
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Nature\'s Way Soil - Professional Organic Fertilizers & Soil Amendments',
  description: 'Discover our premium collection of organic fertilizers, soil boosters, and plant nutrients. Professional-grade products for healthy gardens, lawns, and plants.',
  keywords: 'organic fertilizer, soil amendments, plant nutrients, lawn care, garden fertilizer, hydroponic fertilizer',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Nature\'s Way Soil - Professional Organic Fertilizers',
    description: 'Premium organic fertilizers and soil amendments for healthy gardens and lawns',
    url: '/',
    siteName: 'Nature\'s Way Soil',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nature\'s Way Soil - Organic Gardening Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nature\'s Way Soil - Professional Organic Fertilizers',
    description: 'Premium organic fertilizers and soil amendments for healthy gardens and lawns',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gradient-to-br from-green-50 to-emerald-50`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
