import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { wsHandler } from '@/lib/websocket'
import { requireAuth } from '@/lib/auth'
import { cacheDelete, createCacheKey } from '@/lib/cache'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)
    if (!auth) return new NextResponse('Unauthorized', { status: 401 })

    const data = await req.json()
    const workflow = await prisma.workflow.update({
      where: { id: params.id },
      data
    })

    // Invalidate cache
    await cacheDelete(createCacheKey('workflows', auth.userId))

    // Broadcast the updated workflow
    wsHandler.broadcast({
      type: 'workflow_update',
      payload: workflow
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Failed to update workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    await prisma.workflow.delete({
      where: { id: params.id }
    })

    // Broadcast the deletion
    wsHandler.broadcast({
      type: 'workflow_delete',
      payload: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 