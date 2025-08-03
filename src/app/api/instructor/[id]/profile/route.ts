import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const instructorId = params.id

    // Get instructor with detailed information
    const instructor = await prisma.user.findUnique({
      where: {
        id: instructorId,
        role: 'INSTRUCTOR',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        instructorActivities: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            creditsRequired: true,
            maxCapacity: true,
            classes: {
              where: {
                startTime: {
                  gte: new Date() // Only future classes
                }
              },
              select: {
                id: true,
                startTime: true,
                endTime: true,
                location: true,
                maxCapacity: true,
                bookings: {
                  where: { status: 'CONFIRMED' },
                  select: { id: true }
                }
              },
              orderBy: {
                startTime: 'asc'
              }
            }
          }
        },
        instructorSubscriptions: {
          where: { isActive: true },
          select: {
            id: true,
            customerId: true
          }
        }
      }
    })

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    // Transform the data to match the frontend interface
    const transformedInstructor = {
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      bio: instructor.bio,
      specialties: instructor.specialties,
      activities: instructor.instructorActivities.map(activity => ({
        id: activity.id,
        name: activity.title,
        description: activity.description,
        category: activity.category,
        creditsRequired: activity.creditsRequired,
        maxCapacity: activity.maxCapacity,
        classes: activity.classes.map(classItem => ({
          id: classItem.id,
          date: classItem.startTime.toISOString().split('T')[0],
          startTime: classItem.startTime.toTimeString().split(' ')[0],
          endTime: classItem.endTime.toTimeString().split(' ')[0],
          location: classItem.location,
          capacity: classItem.maxCapacity || activity.maxCapacity,
          bookedSlots: classItem.bookings.length,
          creditCost: activity.creditsRequired
        }))
      })),
      subscriberCount: instructor.instructorSubscriptions.length,
      isSubscribed: instructor.instructorSubscriptions.some(
        sub => sub.customerId === decoded.userId
      )
    }

    return NextResponse.json({ instructor: transformedInstructor })

  } catch (error) {
    console.error('Get instructor profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
