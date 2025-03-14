import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from "@/context/AuthContext";
import FooterWithYear from '@/components/layout/FooterWithYear';

// Use Inter as the default font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'BPO Security Framework',
  description: 'A comprehensive security testing and compliance framework for BPO organizations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <AuthProvider>
          <main className="flex-grow">
            {children}
          </main>
          <FooterWithYear />
        </AuthProvider>
      </body>
    </html>
  )
}
