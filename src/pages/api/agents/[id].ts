import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid agent ID' })
  }

  switch (req.method) {
    case 'GET':
      return getAgent(req, res, id, auth.userId)
    case 'PUT':
      return updateAgent(req, res, id, auth.userId)
    case 'DELETE':
      return deleteAgent(req, res, id, auth.userId)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getAgent(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  userId: string
) {
  try {
    const agent = await prisma.agent.findFirst({
      where: { id, userId }
    })

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    return res.status(200).json({ agent })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function updateAgent(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  userId: string
) {
  try {
    const { name, config, status } = req.body

    const agent = await prisma.agent.findFirst({
      where: { id, userId }
    })

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        name,
        config,
        status
      }
    })

    return res.status(200).json({ agent: updatedAgent })
  } catch (error) {
    console.error('Error updating agent:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function deleteAgent(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  userId: string
) {
  try {
    const agent = await prisma.agent.findFirst({
      where: { id, userId }
    })

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    await prisma.agent.delete({
      where: { id }
    })

    return res.status(200).json({ message: 'Agent deleted successfully' })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 