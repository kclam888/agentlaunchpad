import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateWebhookUrl } from '@/lib/n8n'

export async function POST(req: Request) {
  try {
    const { workflowId, event, data } = await req.json()

    // Get workflow and associated integration settings
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        user: {
          include: {
            integration: true
          }
        }
      }
    })

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    const n8nUrl = workflow.user.integration?.n8nUrl
    if (!n8nUrl || !validateWebhookUrl(n8nUrl)) {
      return NextResponse.json(
        { error: 'Invalid n8n webhook URL' },
        { status: 400 }
      )
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        type: 'WORKFLOW_EVENT',
        status: event,
        message: `Workflow ${event} event received`,
        metadata: data,
        workflowId: workflow.id,
        userId: workflow.userId
      }
    })

    return NextResponse.json({ 
      message: 'Webhook processed successfully' 
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
} 