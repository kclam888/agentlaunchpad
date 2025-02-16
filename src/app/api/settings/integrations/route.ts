import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const integrations = await prisma.integration.findUnique({
      where: { userId: auth.userId }
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Failed to fetch integrations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const data = await req.json()
    
    const integrations = await prisma.integration.upsert({
      where: { userId: auth.userId },
      update: data,
      create: {
        userId: auth.userId,
        ...data
      }
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Failed to update integrations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 