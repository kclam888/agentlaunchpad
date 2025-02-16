import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createCronJob } from '@/lib/cron'

export async function POST(req: Request) {
  const auth = await requireAuth(req)
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const data = await req.json()
    
    // Create schedule in database
    const schedule = await prisma.simulationSchedule.create({
      data: {
        ...data,
        createdBy: auth.userId,
        status: 'active'
      }
    })

    // Create cron job
    await createCronJob({
      name: `simulation-${schedule.id}`,
      schedule: convertToSchedule(data.frequency, data.time),
      command: `node scripts/run-simulation.js ${schedule.id}`
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Failed to create schedule:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function convertToSchedule(frequency: string, time: string): string {
  const [hours, minutes] = time.split(':')
  switch (frequency) {
    case 'daily':
      return `${minutes} ${hours} * * *`
    case 'weekly':
      return `${minutes} ${hours} * * 1` // Monday
    case 'monthly':
      return `${minutes} ${hours} 1 * *` // 1st of month
    default:
      throw new Error('Invalid frequency')
  }
} 