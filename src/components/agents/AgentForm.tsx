'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'
import { AgentType } from '@prisma/client'

interface AgentFormData {
  name: string
  type: AgentType
  config: Record<string, any>
}

interface AgentFormProps {
  initialData?: Partial<AgentFormData>
  onSubmit: (data: AgentFormData) => Promise<void>
  onCancel: () => void
}

export function AgentForm({ initialData, onSubmit, onCancel }: AgentFormProps) {
  const [formData, setFormData] = useState<AgentFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'ONBOARDING',
    config: initialData?.config || {}
  })
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      addNotification({
        type: 'success',
        title: 'Success',
        message: `Agent ${initialData ? 'updated' : 'created'} successfully`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} agent`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
          Agent Name
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
        <label htmlFor="type" className="block text-sm font-medium text-gray-400 mb-2">
          Agent Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AgentType }))}
          className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ONBOARDING">Onboarding</option>
          <option value="SUPPORT">Support</option>
          <option value="ANALYSIS">Analysis</option>
        </select>
      </div>

      <div>
        <label htmlFor="config" className="block text-sm font-medium text-gray-400 mb-2">
          Configuration
        </label>
        <textarea
          id="config"
          value={JSON.stringify(formData.config, null, 2)}
          onChange={(e) => {
            try {
              const config = JSON.parse(e.target.value)
              setFormData(prev => ({ ...prev, config }))
            } catch (error) {
              // Allow invalid JSON while typing
            }
          }}
          className="w-full h-48 px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter JSON configuration"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update Agent' : 'Create Agent'}
        </button>
      </div>
    </form>
  )
} 