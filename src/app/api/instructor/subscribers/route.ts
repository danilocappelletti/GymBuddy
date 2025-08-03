import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Verify the user is an instructor
    const instructor = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        role: 'INSTRUCTOR'
      }
    })

    if (!instructor) {
      return NextResponse.json({ error: 'Only instructors can access subscribers' }, { status: 403 })
    }

    // Get instructor's subscribers
    const subscribers = await prisma.instructorSubscription.findMany({
      where: {
        instructorId: decoded.userId,
        isActive: true
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            credits: true,
            bookings: {
              where: {
                activity: {
                  instructorId: decoded.userId
                }
              },
              select: {
                id: true,
                status: true,
                bookedAt: true
              }
            }
          }
        }
      },
      orderBy: {
        subscribedAt: 'desc'
      }
    })

    // Transform the data to include booking statistics
    const subscribersWithStats = subscribers.map(subscription => {
      const customer = subscription.customer
      const totalBookings = customer.bookings.length
      const confirmedBookings = customer.bookings.filter(b => b.status === 'CONFIRMED').length
      
      return {
        id: subscription.id,
        subscribedAt: subscription.subscribedAt,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          credits: customer.credits,
          totalBookings,
          confirmedBookings
        }
      }
    })

    return NextResponse.json({ subscribers: subscribersWithStats })

  } catch (error) {
    console.error('Get subscribers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
