import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  switch (req.method) {
    case 'GET':
      return getAgents(req, res, auth.userId)
    case 'POST':
      return createAgent(req, res, auth.userId)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getAgents(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const agents = await prisma.agent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json({ agents })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function createAgent(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { name, type, config } = req.body

    if (!name || !type || !config) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        type,
        config,
        userId
      }
    })

    return res.status(201).json({ agent })
  } catch (error) {
    console.error('Error creating agent:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 