import { verify } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from './prisma'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export interface AuthToken {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export interface AuthUser {
  userId: string
  email: string
  role: string
}

export async function validateAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthToken | null> {
  try {
    const token = req.cookies.auth_token

    if (!token) {
      return null
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as AuthToken
    return decoded
  } catch (error) {
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<AuthUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    )
    
    return verified.payload as AuthUser
  } catch (error) {
    console.error('Auth verification failed:', error)
    return null
  }
}

export async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  const auth = await validateAuth(req, res)
  
  if (!auth) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  return user
} 