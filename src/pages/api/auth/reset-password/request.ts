import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // TODO: Send email with reset link
    // For now, just return success (in production, don't reveal if email exists)
    return res.status(200).json({ 
      message: 'If an account exists with this email, a password reset link will be sent.' 
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 