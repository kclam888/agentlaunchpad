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
    const { agentId, limit = '50' } = req.query

    const logs = await prisma.activityLog.findMany({
      where: {
        ...(agentId ? { agentId: String(agentId) } : { userId: auth.userId })
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(String(limit)),
      include: {
        agent: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    return res.status(200).json({ logs })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 