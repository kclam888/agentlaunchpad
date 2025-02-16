import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createBackup } from '@/lib/backup'

export async function POST(req: Request) {
  const auth = await requireAuth(req)
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const result = await createBackup()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Backup failed:', error)
    return new NextResponse('Backup failed', { status: 500 })
  }
} 