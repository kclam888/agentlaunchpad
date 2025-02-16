'use client'

import { useState } from 'react'
import { User } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

interface ProfileData {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ProfileSettings({ user }: { user: any }) {
  const [formData, setFormData] = useState<ProfileData>({
    name: user.name,
    email: user.email
  })
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update profile')

      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-500 bg-opacity-10 rounded-lg">
          <User className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={formData.currentPassword || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={formData.newPassword || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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