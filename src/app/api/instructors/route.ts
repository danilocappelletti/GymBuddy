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

    // Get all instructors with their activities and subscriber count
    const instructors = await prisma.user.findMany({
      where: {
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
            classes: {
              where: {
                startTime: {
                  gte: new Date() // Only future classes
                }
              },
              select: {
                id: true,
                startTime: true,
                endTime: true
              },
              orderBy: {
                startTime: 'asc'
              },
              take: 3 // Show next 3 classes
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
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform the data to include subscription status for current user
    const instructorsWithSubscriptionStatus = instructors.map(instructor => ({
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      bio: instructor.bio,
      specialties: instructor.specialties,
      activities: instructor.instructorActivities,
      subscriberCount: instructor.instructorSubscriptions.length,
      isSubscribed: instructor.instructorSubscriptions.some(sub => sub.customerId === decoded.userId)
    }))

    return NextResponse.json({ instructors: instructorsWithSubscriptionStatus })

  } catch (error) {
    console.error('Get instructors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
