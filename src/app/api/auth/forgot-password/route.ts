import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { validateEmail } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!validateEmail(email)) {
      return NextResponse.json(
        { errors: { email: 'Invalid email address' } },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      })

      // Send reset email
      await sendPasswordResetEmail(email, resetToken)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ 
      message: 'If an account exists with that email, a password reset link has been sent.' 
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
} 