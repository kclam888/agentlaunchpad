'use client'

import { useState } from 'react'
import { User, Key, Bell } from 'lucide-react'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { APISettings } from '@/components/settings/APISettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'

type SettingsTab = 'profile' | 'api' | 'notifications'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  // Mock data - replace with actual API calls
  const user = {
    name: 'John Doe',
    email: 'john@example.com'
  }

  const apiSettings = {
    apiKey: 'sk-123456789',
    n8nUrl: 'https://n8n.example.com'
  }

  const notificationPreferences = {
    email: {
      enabled: true,
      workflow_status: true,
      agent_status: true,
      security_alerts: true
    },
    web: {
      enabled: true,
      workflow_status: true,
      agent_status: true,
      security_alerts: false
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>

      <div className="flex space-x-1 bg-[#1A1721] p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[#13111A] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'profile' && <ProfileSettings user={user} />}
        {activeTab === 'api' && <APISettings {...apiSettings} />}
        {activeTab === 'notifications' && (
          <NotificationSettings initialPreferences={notificationPreferences} />
        )}
      </div>
    </div>
  )
} 