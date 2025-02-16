'use client'

import { useEffect, useState } from 'react'
import { Workflow } from '@prisma/client'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { WorkflowCard } from './WorkflowCard'
import { trackPerformance } from '@/lib/monitoring'

export function WorkflowList({ initialWorkflows }: { initialWorkflows: Workflow[] }) {
  const [workflows, setWorkflows] = useState(initialWorkflows)
  const { sendMessage } = useWebSocket()

  useEffect(() => {
    // Subscribe to workflow updates
    sendMessage('subscribe', { type: 'workflow_updates' })
  }, [sendMessage])

  useEffect(() => {
    const handleWorkflowUpdate = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (data.type === 'workflow_update') {
        setWorkflows(prev => prev.map(workflow => 
          workflow.id === data.payload.id ? data.payload : workflow
        ))
      } else if (data.type === 'workflow_delete') {
        setWorkflows(prev => prev.filter(workflow => workflow.id !== data.payload.id))
      } else if (data.type === 'workflow_create') {
        setWorkflows(prev => [...prev, data.payload])
      }
    }

    window.addEventListener('message', handleWorkflowUpdate)
    return () => window.removeEventListener('message', handleWorkflowUpdate)
  }, [])

  useEffect(() => {
    const perf = trackPerformance('component.WorkflowList.mount', {
      initialWorkflowCount: initialWorkflows.length
    })
    return () => perf.finish()
  }, [initialWorkflows.length])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map(workflow => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          onUpdate={(updatedWorkflow) => {
            setWorkflows(prev => prev.map(w => 
              w.id === updatedWorkflow.id ? updatedWorkflow : w
            ))
          }}
          onDelete={(id) => {
            setWorkflows(prev => prev.filter(w => w.id !== id))
          }}
        />
      ))}
    </div>
  )
} 