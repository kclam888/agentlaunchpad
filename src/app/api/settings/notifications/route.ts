import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: auth.userId }
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const data = await req.json()
    
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: auth.userId },
      update: data,
      create: {
        userId: auth.userId,
        ...data
      }
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Failed to update notification preferences:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 