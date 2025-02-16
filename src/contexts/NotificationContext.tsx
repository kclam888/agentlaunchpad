'use client'

import React, { createContext, useContext, useState } from 'react'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (message: string, type: Notification['type']) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (message: string, type: Notification['type']) => {
    const id = Math.random().toString(36).substring(7)
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => removeNotification(id), 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
} 