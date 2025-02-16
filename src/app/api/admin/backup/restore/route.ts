import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { restoreBackup } from '@/lib/backup'

export async function POST(req: Request) {
  const auth = await requireAuth(req)
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { filename } = await req.json()
    const result = await restoreBackup(filename)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Restore failed:', error)
    return new NextResponse('Restore failed', { status: 500 })
  }
} 