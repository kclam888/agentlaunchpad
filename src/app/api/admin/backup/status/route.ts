import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { checkBackupStatus } from '@/lib/backup-monitor'

export async function GET(req: Request) {
  const auth = await requireAuth(req)
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const status = await checkBackupStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Backup status check failed:', error)
    return new NextResponse('Failed to check backup status', { status: 500 })
  }
} 