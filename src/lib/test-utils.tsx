import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { AuthProvider } from '@/contexts/AuthContext'

function render(ui: React.ReactElement, options = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider>
        <WebSocketProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </WebSocketProvider>
      </AuthProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { render } 