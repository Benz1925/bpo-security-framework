import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

// Use Inter as the default font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'BPO Security Framework',
  description: 'Security Assessment Framework for BPO Services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script src="/config.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
            <footer className="mt-8 border-t border-gray-200 bg-white">
              <div className="container mx-auto py-4 px-4 md:px-6">
                <div className="flex flex-col items-center justify-between gap-2 md:h-14 md:flex-row">
                  <p className="text-sm text-muted-foreground text-center md:text-left">
                    © {new Date().getFullYear()} BPO Security Framework. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Version 1.0.0
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
