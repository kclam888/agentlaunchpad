'use client'

import { useState } from 'react'
import { Key, Copy, Check } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

interface APISettingsProps {
  apiKey: string
  n8nUrl?: string
}

export function APISettings({ apiKey, n8nUrl }: APISettingsProps) {
  const [formData, setFormData] = useState({
    n8nUrl: n8nUrl || ''
  })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update settings')

      addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Integration settings have been updated successfully'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update integration settings'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-500 bg-opacity-10 rounded-lg">
          <Key className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">API Settings</h2>
          <p className="text-gray-400">Manage your API keys and integration endpoints</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            API Key
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="flex-1 px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none"
            />
            <button
              onClick={copyApiKey}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Use this API key to authenticate your requests to our API
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="n8nUrl" className="block text-sm font-medium text-gray-400 mb-2">
              n8n Webhook URL
            </label>
            <input
              id="n8nUrl"
              type="url"
              value={formData.n8nUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, n8nUrl: e.target.value }))}
              className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://n8n.your-domain.com"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your n8n instance URL to enable workflow automation
            </p>
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
    </div>
  )
} 