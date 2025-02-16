import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { corsMiddleware, securityHeaders } from '@/lib/security'
import { rateLimiter } from '@/lib/rate-limit'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = corsMiddleware(request)
  if (corsResponse.status !== 200) return corsResponse

  // Apply rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || '127.0.0.1'
    const rateLimitResponse = await rateLimiter(ip)
    if (rateLimitResponse) return rateLimitResponse
  }

  const pathname = request.nextUrl.pathname

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return securityHeaders(NextResponse.next())
  }

  // Check auth for API routes
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth/')) {
      return securityHeaders(NextResponse.next())
    }

    const auth = await requireAuth(request)
    if (!auth) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return securityHeaders(NextResponse.next())
  }

  // Check auth for pages
  const auth = await requireAuth(request)
  if (!auth) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return securityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 