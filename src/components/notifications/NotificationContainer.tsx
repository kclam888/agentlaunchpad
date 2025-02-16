'use client'

import { useNotification } from '@/contexts/NotificationContext'
import { NotificationToast } from './NotificationToast'

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
} 