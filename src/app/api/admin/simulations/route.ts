import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const auth = await requireAuth(req)
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const simulations = await prisma.recoverySimulation.findMany({
      orderBy: { executedAt: 'desc' },
      take: 50
    })

    return NextResponse.json(simulations)
  } catch (error) {
    console.error('Failed to fetch simulations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 