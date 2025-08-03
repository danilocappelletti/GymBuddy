import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const { instructorId } = await request.json()

    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 })
    }

    // Verify the instructor exists and has INSTRUCTOR role
    const instructor = await prisma.user.findUnique({
      where: { 
        id: instructorId,
        role: 'INSTRUCTOR'
      }
    })

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    // Check if already subscribed
    const existingSubscription = await prisma.instructorSubscription.findUnique({
      where: {
        instructorId_customerId: {
          instructorId: instructorId,
          customerId: decoded.userId
        }
      }
    })

    if (existingSubscription && existingSubscription.isActive) {
      return NextResponse.json({ error: 'Already subscribed to this instructor' }, { status: 400 })
    }

    // Create or reactivate subscription
    let subscription
    if (existingSubscription) {
      subscription = await prisma.instructorSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          isActive: true,
          subscribedAt: new Date(),
          unsubscribedAt: null
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
              specialties: true
            }
          }
        }
      })
    } else {
      subscription = await prisma.instructorSubscription.create({
        data: {
          instructorId: instructorId,
          customerId: decoded.userId
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
              specialties: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Successfully subscribed to instructor',
      subscription
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const { instructorId } = await request.json()

    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 })
    }

    // Find and deactivate subscription
    const subscription = await prisma.instructorSubscription.findUnique({
      where: {
        instructorId_customerId: {
          instructorId: instructorId,
          customerId: decoded.userId
        }
      }
    })

    if (!subscription || !subscription.isActive) {
      return NextResponse.json({ error: 'Not subscribed to this instructor' }, { status: 400 })
    }

    await prisma.instructorSubscription.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Successfully unsubscribed from instructor'
    })

  } catch (error) {
    console.error('Unsubscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Get user's subscriptions
    const subscriptions = await prisma.instructorSubscription.findMany({
      where: {
        customerId: decoded.userId,
        isActive: true
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            specialties: true,
            instructorActivities: {
              select: {
                id: true,
                title: true,
                category: true
              },
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: {
        subscribedAt: 'desc'
      }
    })

    return NextResponse.json({ subscriptions })

  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
