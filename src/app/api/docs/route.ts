import { NextResponse } from 'next/server'
import { apiSpec } from '@/lib/api-docs'

export async function GET() {
  return NextResponse.json(apiSpec)
} 