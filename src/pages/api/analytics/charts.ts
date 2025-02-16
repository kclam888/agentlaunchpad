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
    const { period = '7d' } = req.query
    const startDate = getStartDate(String(period))

    const activityData = await prisma.activityLog.groupBy({
      by: ['createdAt', 'status'],
      where: {
        userId: auth.userId,
        createdAt: {
          gte: startDate
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    })

    const formattedData = formatChartData(activityData)
    return res.status(200).json({ data: formattedData })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getStartDate(period: string): Date {
  const now = new Date()
  switch (period) {
    case '24h':
      return new Date(now.setHours(now.getHours() - 24))
    case '7d':
      return new Date(now.setDate(now.getDate() - 7))
    case '30d':
      return new Date(now.setDate(now.getDate() - 30))
    default:
      return new Date(now.setDate(now.getDate() - 7))
  }
}

function formatChartData(data: any[]) {
  // Group by date and format for charts
  const groupedData = data.reduce((acc, item) => {
    const date = item.createdAt.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = {
        date,
        SUCCESS: 0,
        ERROR: 0,
        IN_PROGRESS: 0
      }
    }
    acc[date][item.status] = item._count
    return acc
  }, {})

  return Object.values(groupedData)
} 