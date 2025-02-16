import { prisma } from './prisma'
import { broadcastToUser } from './websocket'
import type { Server as WebSocketServer } from 'ws'

export interface ActivityLog {
  agentId: string
  type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'TASK_FAILED' | 'WORKFLOW_TRIGGERED'
  status: 'SUCCESS' | 'ERROR' | 'IN_PROGRESS'
  message: string
  metadata?: Record<string, any>
}

export class ActivityLogger {
  private wss: WebSocketServer

  constructor(wss: WebSocketServer) {
    this.wss = wss
  }

  async log(activity: ActivityLog) {
    try {
      // Get the agent to find the user
      const agent = await prisma.agent.findUnique({
        where: { id: activity.agentId },
        include: { user: true }
      })

      if (!agent) {
        throw new Error('Agent not found')
      }

      // Create activity log in database
      const log = await prisma.activityLog.create({
        data: {
          agentId: activity.agentId,
          type: activity.type,
          status: activity.status,
          message: activity.message,
          metadata: activity.metadata || {},
          userId: agent.userId
        }
      })

      // Broadcast to user in real-time
      broadcastToUser(this.wss, agent.userId, {
        type: 'ACTIVITY_LOG',
        data: log
      })

      return log
    } catch (error) {
      console.error('Error logging activity:', error)
      throw error
    }
  }

  async getAgentLogs(agentId: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  async getUserLogs(userId: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        agent: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })
  }
} 