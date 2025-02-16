'use client'

import { Workflow, WorkflowStatus } from '@prisma/client'
import { Flow, Settings, Trash2, PlayCircle, StopCircle, ExternalLink } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

interface WorkflowCardProps {
  workflow: Workflow
  onDelete: (id: string) => Promise<void>
  onStatusChange: (id: string, status: WorkflowStatus) => Promise<void>
  onEdit: (workflow: Workflow) => void
}

export function WorkflowCard({ workflow, onDelete, onStatusChange, onEdit }: WorkflowCardProps) {
  const { addNotification } = useNotification()

  const handleStatusToggle = async () => {
    try {
      const newStatus = workflow.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await onStatusChange(workflow.id, newStatus)
      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Workflow ${workflow.name} is now ${newStatus.toLowerCase()}`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update workflow status'
      })
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(workflow.id)
      addNotification({
        type: 'success',
        title: 'Workflow Deleted',
        message: `${workflow.name} has been deleted successfully`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete workflow'
      })
    }
  }

  const openN8N = () => {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_URL
    if (n8nUrl && workflow.config.n8nWorkflowId) {
      window.open(`${n8nUrl}/workflow/${workflow.config.n8nWorkflowId}`, '_blank')
    }
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 bg-opacity-10 rounded-lg">
            <Flow className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-white font-medium">{workflow.name}</h3>
            <p className="text-gray-400 text-sm">
              {workflow.config.n8nWorkflowId ? 'n8n Workflow' : 'Local Workflow'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusToggle}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            {workflow.status === 'ACTIVE' ? (
              <StopCircle className="w-5 h-5" />
            ) : (
              <PlayCircle className="w-5 h-5" />
            )}
          </button>
          {workflow.config.n8nWorkflowId && (
            <button
              onClick={openN8N}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onEdit(workflow)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-800"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-[#13111A] p-3 rounded-lg">
          <span className="text-gray-400 text-sm">Status</span>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              workflow.status === 'ACTIVE' ? 'bg-green-500' : 
              workflow.status === 'ERROR' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-white">{workflow.status}</span>
          </div>
        </div>
        <div className="bg-[#13111A] p-3 rounded-lg">
          <span className="text-gray-400 text-sm">Last Run</span>
          <div className="text-white mt-1">
            {new Date(workflow.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
} 