'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Notification } from '@/contexts/NotificationContext'

interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification.id, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  }

  return (
    <div className="bg-[#1A1721] rounded-lg shadow-lg p-4 mb-4 flex items-start gap-3 w-96 animate-slide-in">
      {icons[notification.type]}
      <div className="flex-1">
        <h4 className="text-white font-medium">{notification.title}</h4>
        <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="text-gray-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
} 