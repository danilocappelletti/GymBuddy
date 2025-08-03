import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Verify user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Instructor access required' },
        { status: 403 }
      )
    }

    // Await params before destructuring to comply with Next.js 15
    const { classId } = await params

    // Get class details to verify instructor ownership
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        activity: {
          select: {
            instructorId: true,
            creditsRequired: true
          }
        }
      }
    })

    if (!classDetails) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Verify the instructor owns this class
    if (classDetails.activity.instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Fetch all bookings for this class (confirmed attendees)
    const bookings = await prisma.booking.findMany({
      where: {
        classId: classId,
        status: 'CONFIRMED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        bookedAt: 'desc'
      }
    })

    // Fetch class invitations that were accepted
    const acceptedInvitations = await prisma.classInvitation.findMany({
      where: {
        classId: classId,
        status: 'ACCEPTED'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    // Combine bookings and accepted invitations
    const attendees = [
      ...bookings.map(booking => ({
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone,
        type: 'booking',
        bookedAt: booking.bookedAt,
        creditsUsed: booking.creditsUsed
      })),
      ...acceptedInvitations.map(invitation => ({
        id: invitation.customer.id,
        name: invitation.customer.name,
        email: invitation.customer.email,
        phone: invitation.customer.phone,
        type: 'invitation',
        acceptedAt: invitation.respondedAt,
        creditsUsed: classDetails.activity.creditsRequired
      }))
    ]

    // Remove duplicates (in case someone both booked and was invited)
    const uniqueAttendees = attendees.filter((attendee, index, self) =>
      index === self.findIndex(a => a.id === attendee.id)
    )

    return NextResponse.json({
      success: true,
      attendees: uniqueAttendees,
      totalAttendees: uniqueAttendees.length
    })

  } catch (error) {
    console.error('Error fetching class attendees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
