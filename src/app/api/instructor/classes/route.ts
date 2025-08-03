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
    
    if (!decoded.userId || decoded.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Instructor access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { activityId, startTime, endTime, location } = body

    // Validate required fields
    if (!activityId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Activity ID, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Verify the activity belongs to this instructor
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        instructorId: decoded.userId
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found or not owned by this instructor' },
        { status: 404 }
      )
    }

    // Create class
    const classItem = await prisma.class.create({
      data: {
        activityId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || 'TBD',
        maxCapacity: activity.maxCapacity
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json(classItem, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
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
    
    if (!decoded.userId || decoded.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Instructor access required' },
        { status: 403 }
      )
    }

    // Get instructor's classes
    const classes = await prisma.class.findMany({
      where: {
        activity: {
          instructorId: decoded.userId
        },
        isActive: true,
        startTime: {
          gte: new Date()
        }
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            maxCapacity: true
          }
        },
        bookings: {
          where: {
            status: 'CONFIRMED'
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Transform the data to match the expected format
    const transformedClasses = classes.map(classItem => ({
      id: classItem.id,
      activity: classItem.activity,
      startTime: classItem.startTime.toISOString(),
      endTime: classItem.endTime.toISOString(),
      location: classItem.location || 'TBD',
      maxCapacity: classItem.maxCapacity || classItem.activity.maxCapacity,
      enrolled: classItem.bookings.length,
      isActive: classItem.isActive
    }))

    return NextResponse.json({
      success: true,
      classes: transformedClasses
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}
