import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { wsHandler } from '@/lib/websocket'
import { requireAuth } from '@/lib/auth'
import { trackPerformance, captureError } from '@/lib/monitoring'
import { cacheGet, cacheSet, createCacheKey, workflowCache, hierarchicalWorkflowCache, enhancedHierarchicalWorkflowCache } from '@/lib/cache'

/**
 * @swagger
 * /api/workflows:
 *   get:
 *     summary: Get all workflows
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workflows
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workflows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workflow'
 */
export async function GET() {
  return NextResponse.json({ workflows: [] })
}

/**
 * @swagger
 * /api/workflows:
 *   post:
 *     summary: Create a new workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowInput'
 *     responses:
 *       200:
 *         description: Created workflow
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workflow:
 *                   $ref: '#/components/schemas/Workflow'
 */
export async function POST(req: Request) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const data = await req.json()
    const workflow = await prisma.workflow.create({
      data: {
        ...data,
        userId: auth.userId
      }
    })

    // Broadcast the new workflow to all connected clients
    wsHandler.broadcast({
      type: 'workflow_create',
      payload: workflow
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Failed to create workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 