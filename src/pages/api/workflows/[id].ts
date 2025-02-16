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

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid workflow ID' })
  }

  switch (req.method) {
    case 'GET':
      return getWorkflow(req, res, id, auth.userId)
    case 'PUT':
      return updateWorkflow(req, res, id, auth.userId)
    case 'DELETE':
      return deleteWorkflow(req, res, id, auth.userId)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getWorkflow(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  userId: string
) {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' })
    }

    // Get n8n workflow status
    const n8nWorkflow = await n8nClient.getWorkflow(workflow.config.n8nWorkflowId)
    
    return res.status(200).json({
      workflow: {
        ...workflow,
        n8nStatus: n8nWorkflow.active ? 'ACTIVE' : 'INACTIVE'
      }
    })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function updateWorkflow(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  userId: string
) {
  try {
    const { name, config, status } = req.body

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId }
    })

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' })
    }

    // Update n8n workflow if needed
    if (config) {
      await n8nClient.updateWorkflow(workflow.config.n8nWorkflowId, {
        name: name || workflow.name,
        ...config
      })
    }

    // Update status in n8n if changed
    if (status) {
      if (status === 'ACTIVE') {
        await n8nClient.activateWorkflow(workflow.config.n8nWorkflowId)
      } else {
        await n8nClient.deactivateWorkflow(workflow.config.n8nWorkflowId)
      }
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id },
      data: {
        name,
        config: config ? { ...workflow.config, ...config } : undefined,
        status
      }
    })

    return res.status(200).json({ workflow: updatedWorkflow })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function deleteWorkflow(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  userId: string
) {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId }
    })

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' })
    }

    // Delete from n8n first
    await n8nClient.deleteWorkflow(workflow.config.n8nWorkflowId)

    // Then delete from our database
    await prisma.workflow.delete({
      where: { id }
    })

    return res.status(200).json({ message: 'Workflow deleted successfully' })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 