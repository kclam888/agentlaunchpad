'use client'

import React from 'react'
import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface WorkflowFormData {
  name: string
  config: Record<string, any>
  webhookUrl?: string | null
}

interface WorkflowFormProps {
  initialData?: Partial<WorkflowFormData>
  onSubmit: (data: WorkflowFormData) => Promise<void>
  onCancel: () => void
}

interface FormState {
  name: string
  config: Record<string, any>
  webhook: {
    enabled: boolean
    url: string
  }
}

export function WorkflowForm({ initialData, onSubmit, onCancel }: WorkflowFormProps) {
  const [formData, setFormData] = useState<FormState>({
    name: initialData?.name || '',
    config: initialData?.config || {},
    webhook: {
      enabled: !!initialData?.webhookUrl,
      url: initialData?.webhookUrl || ''
    }
  })
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const submitData = {
      name: formData.name,
      config: formData.config,
      webhookUrl: formData.webhook.enabled ? formData.webhook.url : null
    }

    try {
      await onSubmit(submitData)
      addNotification({
        type: 'success',
        title: 'Success',
        message: `Workflow ${initialData ? 'updated' : 'created'} successfully`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} workflow`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
          Workflow Name
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

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="webhook-enabled"
            checked={formData.webhook.enabled}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              webhook: {
                ...prev.webhook,
                enabled: e.target.checked
              }
            }))}
            className="w-4 h-4 text-blue-500 rounded border-gray-700 bg-gray-800 focus:ring-blue-500"
          />
          <label htmlFor="webhook-enabled" className="text-sm text-gray-400">
            Enable n8n webhook
          </label>
        </div>

        {formData.webhook.enabled && (
          <div>
            <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-400 mb-2">
              Webhook URL
            </label>
            <input
              id="webhook-url"
              type="url"
              value={formData.webhook.url}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                webhook: {
                  ...prev.webhook,
                  url: e.target.value
                }
              }))}
              className="w-full px-3 py-2 bg-[#13111A] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://n8n.your-domain.com/webhook/..."
              required={formData.webhook.enabled}
            />
          </div>
        )}
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
          {loading ? 'Saving...' : initialData ? 'Update Workflow' : 'Create Workflow'}
        </button>
      </div>
    </form>
  )
} 