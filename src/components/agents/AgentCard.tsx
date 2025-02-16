'use client'

import { Bot, Settings, Trash2, PlayCircle, StopCircle } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'
import { Agent, AgentStatus } from '@prisma/client'

interface AgentCardProps {
  agent: Agent
  onDelete: (id: string) => Promise<void>
  onStatusChange: (id: string, status: AgentStatus) => Promise<void>
}

export function AgentCard({ agent, onDelete, onStatusChange }: AgentCardProps) {
  const { addNotification } = useNotification()

  const handleStatusToggle = async () => {
    try {
      const newStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await onStatusChange(agent.id, newStatus)
      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Agent ${agent.name} is now ${newStatus.toLowerCase()}`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update agent status'
      })
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(agent.id)
      addNotification({
        type: 'success',
        title: 'Agent Deleted',
        message: `${agent.name} has been deleted successfully`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete agent'
      })
    }
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 bg-opacity-10 rounded-lg">
            <Bot className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-white font-medium">{agent.name}</h3>
            <p className="text-gray-400 text-sm">{agent.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusToggle}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            {agent.status === 'ACTIVE' ? (
              <StopCircle className="w-5 h-5" />
            ) : (
              <PlayCircle className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => {}} // TODO: Add edit functionality
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
              agent.status === 'ACTIVE' ? 'bg-green-500' : 
              agent.status === 'ERROR' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-white">{agent.status}</span>
          </div>
        </div>
        <div className="bg-[#13111A] p-3 rounded-lg">
          <span className="text-gray-400 text-sm">Last Active</span>
          <div className="text-white mt-1">
            {new Date(agent.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
} 