import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any
    
    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { classId } = body

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Get the class details
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        activity: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        bookings: {
          where: { status: 'CONFIRMED' }
        }
      }
    })

    if (!classDetails) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if class is full
    const currentBookings = classDetails.bookings.length
    const maxCapacity = classDetails.maxCapacity || classDetails.activity.maxCapacity
    
    if (currentBookings >= maxCapacity) {
      return NextResponse.json(
        { error: 'Class is full' },
        { status: 400 }
      )
    }

    // Check if user already booked this class
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: decoded.userId,
        classId: classId,
        status: { in: ['CONFIRMED', 'WAITING_LIST'] }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You have already booked this class' },
        { status: 400 }
      )
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.credits < classDetails.activity.creditsRequired) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: decoded.userId,
        activityId: classDetails.activity.id,
        classId: classId,
        status: 'CONFIRMED',
        creditsUsed: classDetails.activity.creditsRequired
      },
      include: {
        activity: true,
        class: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Deduct credits from user
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        credits: {
          decrement: classDetails.activity.creditsRequired
        }
      }
    })

    // Create credit transaction record
    await prisma.creditTransaction.create({
      data: {
        userId: decoded.userId,
        type: 'BOOKING',
        amount: -classDetails.activity.creditsRequired,
        description: `Booked: ${classDetails.activity.title}`
      }
    })

    return NextResponse.json({
      message: 'Booking successful',
      booking,
      remainingCredits: user.credits - classDetails.activity.creditsRequired
    }, { status: 201 })

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any
    
    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId: decoded.userId,
        status: { in: ['CONFIRMED', 'WAITING_LIST'] }
      },
      include: {
        activity: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        class: true
      },
      orderBy: {
        bookedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      bookings: bookings
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
