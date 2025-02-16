import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [
      agentCount,
      workflowCount,
      recentLogs,
      activityStats
    ] = await Promise.all([
      // Get total agents
      prisma.agent.count({
        where: { userId: auth.userId }
      }),
      // Get total workflows
      prisma.workflow.count({
        where: { userId: auth.userId }
      }),
      // Get recent activity logs
      prisma.activityLog.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          agent: {
            select: {
              name: true,
              type: true
            }
          }
        }
      }),
      // Get activity statistics
      prisma.activityLog.groupBy({
        by: ['status'],
        where: { 
          userId: auth.userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        _count: true
      })
    ])

    return res.status(200).json({
      overview: {
        totalAgents: agentCount,
        totalWorkflows: workflowCount,
        recentActivity: recentLogs,
        activityStats: activityStats.reduce((acc, stat) => ({
          ...acc,
          [stat.status]: stat._count
        }), {})
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 