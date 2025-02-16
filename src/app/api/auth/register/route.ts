import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateRegistration, ValidationError } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Validate input
    try {
      validateRegistration(data)
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json({ errors: error.errors }, { status: 400 })
      }
      throw error
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { errors: { email: 'Email already registered' } },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        // Create default notification preferences
        notificationPreferences: {
          create: {
            email: {
              enabled: true,
              workflow_status: true,
              agent_status: true,
              security_alerts: true
            },
            web: {
              enabled: true,
              workflow_status: true,
              agent_status: true,
              security_alerts: true
            }
          }
        },
        // Create default integration settings
        integration: {
          create: {
            apiKey: crypto.randomUUID()
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
} 