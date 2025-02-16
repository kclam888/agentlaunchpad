import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true
      }
    })

    if (!user) {
      return new NextResponse('Invalid credentials', { status: 401 })
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return new NextResponse('Invalid credentials', { status: 401 })
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET))

    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 