'use client'

import { Clock, Bot, RotateCw } from 'lucide-react'

interface Task {
  title: string
  status: 'queued' | 'in_progress' | 'completed'
  timestamp?: string
}

interface TaskContainerProps {
  tasks: Task[]
}

export default function TaskContainer({ tasks }: TaskContainerProps) {
  return (
    <div className="bg-[#1A1721] rounded-lg p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-500" />
        <span className="text-blue-500">In progress</span>
        <div className="flex items-center gap-2 ml-4">
          <Bot className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">Beam Onboarding Agent</span>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div 
            key={index}
            className="bg-[#13111A] rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-white">{task.title}</h3>
                {task.timestamp && (
                  <p className="text-sm text-gray-400">{task.timestamp}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">
                {task.status === 'queued' && 'Queued'}
                {task.status === 'in_progress' && 'In Progress'}
                {task.status === 'completed' && 'Completed'}
              </span>
              <button className="text-blue-500 hover:text-blue-400">
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 