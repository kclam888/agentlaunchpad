'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

interface NotificationPreferences {
  email: {
    enabled: boolean
    workflow_status: boolean
    agent_status: boolean
    security_alerts: boolean
  }
  web: {
    enabled: boolean
    workflow_status: boolean
    agent_status: boolean
    security_alerts: boolean
  }
}

export function NotificationSettings({ initialPreferences }: { initialPreferences: NotificationPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) throw new Error('Failed to update preferences')

      addNotification({
        type: 'success',
        title: 'Preferences Updated',
        message: 'Your notification preferences have been updated'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update notification preferences'
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePreference = (channel: 'email' | 'web', key: keyof typeof preferences.email) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: !prev[channel][key]
      }
    }))
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-yellow-500 bg-opacity-10 rounded-lg">
          <Bell className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
          <p className="text-gray-400">Manage how and when you want to be notified</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Email Notifications</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email.enabled}
                onChange={() => togglePreference('email', 'enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          
          <div className="space-y-4 pl-4">
            {Object.entries(preferences.email)
              .filter(([key]) => key !== 'enabled')
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`email-${key}`}
                    checked={value}
                    onChange={() => togglePreference('email', key as keyof typeof preferences.email)}
                    disabled={!preferences.email.enabled}
                    className="w-4 h-4 text-blue-500 rounded border-gray-700 bg-gray-800 focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor={`email-${key}`}
                    className={`text-sm ${preferences.email.enabled ? 'text-white' : 'text-gray-500'}`}
                  >
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Web Notifications</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.web.enabled}
                onChange={() => togglePreference('web', 'enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          
          <div className="space-y-4 pl-4">
            {Object.entries(preferences.web)
              .filter(([key]) => key !== 'enabled')
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`web-${key}`}
                    checked={value}
                    onChange={() => togglePreference('web', key as keyof typeof preferences.web)}
                    disabled={!preferences.web.enabled}
                    className="w-4 h-4 text-blue-500 rounded border-gray-700 bg-gray-800 focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor={`web-${key}`}
                    className={`text-sm ${preferences.web.enabled ? 'text-white' : 'text-gray-500'}`}
                  >
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 