'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { AgentCard } from '@/components/agents/AgentCard'
import { Modal } from '@/components/shared/Modal'
import { AgentForm } from '@/components/agents/AgentForm'
import { useNotification } from '@/contexts/NotificationContext'
import { Agent, AgentStatus } from '@prisma/client'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data.agents)
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch agents'
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' })
      setAgents(prev => prev.filter(agent => agent.id !== id))
    } catch (error) {
      throw error
    }
  }

  const handleStatusChange = async (id: string, status: AgentStatus) => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const updatedAgent = await response.json()
      setAgents(prev => prev.map(agent => 
        agent.id === id ? updatedAgent.agent : agent
      ))
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      const url = editingAgent 
        ? `/api/agents/${editingAgent.id}`
        : '/api/agents'
      
      const response = await fetch(url, {
        method: editingAgent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      
      if (editingAgent) {
        setAgents(prev => prev.map(agent =>
          agent.id === editingAgent.id ? result.agent : agent
        ))
      } else {
        setAgents(prev => [...prev, result.agent])
      }

      setIsModalOpen(false)
      setEditingAgent(null)
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">AI Agents</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onEdit={() => {
              setEditingAgent(agent)
              setIsModalOpen(true)
            }}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAgent(null)
        }}
        title={editingAgent ? 'Edit Agent' : 'Create New Agent'}
      >
        <AgentForm
          initialData={editingAgent || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingAgent(null)
          }}
        />
      </Modal>
    </div>
  )
} 