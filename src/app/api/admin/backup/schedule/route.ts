import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { scheduleBackup } from '@/lib/backup'
import { z } from 'zod'

const scheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  keepCount: z.number().min(1).max(100)
})

export async function POST(req: Request) {
  const auth = await requireAuth(req)
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const data = await req.json()
    const schedule = scheduleSchema.parse(data)
    await scheduleBackup(schedule)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Schedule setup failed:', error)
    return new NextResponse('Invalid schedule configuration', { status: 400 })
  }
} 