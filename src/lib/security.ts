import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
const MAX_REQUESTS_PER_MINUTE = 100

export function corsMiddleware(req: NextRequest) {
  const origin = req.headers.get('origin')
  
  if (origin && CORS_ORIGINS.includes(origin)) {
    const response = NextResponse.next()
    
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }
  
  return NextResponse.next()
}

export function securityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  return response
} 