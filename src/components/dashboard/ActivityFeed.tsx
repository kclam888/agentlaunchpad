'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface ActivityLog {
  id: string
  type: string
  status: string
  message: string
  createdAt: string
  agent: {
    name: string
    type: string
  }
}

export function ActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const { subscribe } = useWebSocket()

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/activity-logs?limit=10')
        const data = await response.json()
        setLogs(data.logs)
      } catch (error) {
        console.error('Error fetching logs:', error)
      }
    }

    fetchLogs()

    subscribe((message) => {
      if (message.type === 'ACTIVITY_LOG') {
        setLogs(prev => [message.data, ...prev].slice(0, 10))
      }
    })
  }, [subscribe])

  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <h3 className="text-white text-lg mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-4">
            <div className="mt-1">
              {log.status === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {log.status === 'ERROR' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {log.status === 'IN_PROGRESS' && <Clock className="w-5 h-5 text-blue-500" />}
            </div>
            <div>
              <p className="text-white">{log.message}</p>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <span className="text-gray-400">{log.agent.name}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 