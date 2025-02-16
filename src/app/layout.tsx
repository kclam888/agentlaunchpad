import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { NotificationContainer } from '@/components/notifications/NotificationContainer'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Agent Dashboard',
  description: 'Management interface for AI agents and workflows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#13111A]`}>
        <ErrorBoundary>
          <AuthProvider>
            <WebSocketProvider>
              <NotificationProvider>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                      {children}
                    </main>
                  </div>
                </div>
                <NotificationContainer />
              </NotificationProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 