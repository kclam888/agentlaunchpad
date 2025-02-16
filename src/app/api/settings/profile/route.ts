import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { hash } from 'bcryptjs'

export async function GET(req: Request) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  const auth = await requireAuth(req)
  if (!auth) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const { name, email, currentPassword, newPassword } = await req.json()

    const updateData: any = {
      name,
      email
    }

    if (newPassword) {
      if (!currentPassword) {
        return new NextResponse('Current password is required', { status: 400 })
      }

      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { password: true }
      })

      const isValid = await bcrypt.compare(currentPassword, user!.password)
      if (!isValid) {
        return new NextResponse('Invalid current password', { status: 400 })
      }

      updateData.password = await hash(newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Failed to update user profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 