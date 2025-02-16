import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { n8nClient } from '@/lib/n8n'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  switch (req.method) {
    case 'GET':
      return getWorkflows(req, res, auth.userId)
    case 'POST':
      return createWorkflow(req, res, auth.userId)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getWorkflows(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    return res.status(200).json({ workflows })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function createWorkflow(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { name, agentId, config } = req.body

    if (!name || !agentId || !config) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get the associated agent
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId }
    })

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    // Create n8n workflow
    const n8nWorkflow = await n8nClient.createWorkflow(agent)

    // Create workflow in database
    const workflow = await prisma.workflow.create({
      data: {
        name,
        config: {
          ...config,
          n8nWorkflowId: n8nWorkflow.id
        },
        userId,
        status: 'ACTIVE'
      }
    })

    return res.status(201).json({ workflow })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 