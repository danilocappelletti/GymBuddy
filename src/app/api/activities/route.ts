import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      where: { 
        isActive: true,
        instructorId: { not: null } // Only get activities with instructors
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true }
        },
        classes: {
          where: { 
            isActive: true,
            startTime: { gt: new Date() }
          },
          take: 5,
          orderBy: { startTime: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
