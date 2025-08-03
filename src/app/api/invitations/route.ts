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

    const { customerId, classId, message } = await request.json()

    if (!customerId || !classId) {
      return NextResponse.json({ error: 'Customer ID and Class ID are required' }, { status: 400 })
    }

    // Verify the user is an instructor
    const instructor = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        role: 'INSTRUCTOR'
      }
    })

    if (!instructor) {
      return NextResponse.json({ error: 'Only instructors can send invitations' }, { status: 403 })
    }

    // Verify the customer is subscribed to this instructor
    const subscription = await prisma.instructorSubscription.findUnique({
      where: {
        instructorId_customerId: {
          instructorId: decoded.userId,
          customerId: customerId
        },
        isActive: true
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Customer is not subscribed to you' }, { status: 400 })
    }

    // Verify the class exists and belongs to an activity by this instructor
    const classWithActivity = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            instructorId: true,
            creditsRequired: true
          }
        }
      }
    })

    if (!classWithActivity || classWithActivity.activity.instructorId !== decoded.userId) {
      return NextResponse.json({ error: 'Class not found or not owned by you' }, { status: 404 })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.classInvitation.findUnique({
      where: {
        customerId_classId: {
          customerId: customerId,
          classId: classId
        }
      }
    })

    if (existingInvitation && existingInvitation.status === 'PENDING') {
      return NextResponse.json({ error: 'Invitation already sent for this class' }, { status: 400 })
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.classInvitation.create({
      data: {
        instructorId: decoded.userId,
        customerId: customerId,
        classId: classId,
        message: message || `You're invited to join ${classWithActivity.activity.title}!`,
        expiresAt: expiresAt
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
                creditsRequired: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation
    })

  } catch (error) {
    console.error('Send invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const { invitationId, status } = await request.json()

    if (!invitationId || !status || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Valid invitation ID and status (ACCEPTED/DECLINED) are required' }, { status: 400 })
    }

    // Find the invitation
    const invitation = await prisma.classInvitation.findUnique({
      where: { id: invitationId },
      include: {
        class: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                creditsRequired: true,
                maxCapacity: true
              }
            }
          }
        },
        customer: {
          select: {
            credits: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Verify the user is the invited customer
    if (invitation.customerId !== decoded.userId) {
      return NextResponse.json({ error: 'You can only respond to your own invitations' }, { status: 403 })
    }

    // Check if invitation is still valid
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation has already been responded to' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.classInvitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // If accepting, check if user has enough credits
    if (status === 'ACCEPTED') {
      const creditsRequired = invitation.class.activity.creditsRequired
      if (invitation.customer.credits < creditsRequired) {
        return NextResponse.json({ 
          error: `Insufficient credits. You need ${creditsRequired} credits but only have ${invitation.customer.credits}.` 
        }, { status: 400 })
      }

      // Check if class is full
      const bookingCount = await prisma.booking.count({
        where: {
          classId: invitation.classId,
          status: 'CONFIRMED'
        }
      })

      const maxCapacity = invitation.class.maxCapacity || invitation.class.activity.maxCapacity
      if (bookingCount >= maxCapacity) {
        return NextResponse.json({ error: 'Class is full' }, { status: 400 })
      }

      // Create booking and deduct credits
      await prisma.$transaction(async (tx) => {
        // Update invitation status
        await tx.classInvitation.update({
          where: { id: invitationId },
          data: {
            status: status,
            respondedAt: new Date()
          }
        })

        // Create booking
        await tx.booking.create({
          data: {
            userId: decoded.userId,
            activityId: invitation.class.activityId,
            classId: invitation.classId,
            creditsUsed: creditsRequired
          }
        })

        // Deduct credits
        await tx.user.update({
          where: { id: decoded.userId },
          data: {
            credits: {
              decrement: creditsRequired
            }
          }
        })

        // Create credit transaction
        await tx.creditTransaction.create({
          data: {
            userId: decoded.userId,
            type: 'BOOKING',
            amount: -creditsRequired,
            description: `Booked ${invitation.class.activity.title} via invitation`
          }
        })
      })

      return NextResponse.json({
        message: 'Invitation accepted and class booked successfully!',
        creditsUsed: creditsRequired
      })

    } else {
      // Just update invitation status for declined
      await prisma.classInvitation.update({
        where: { id: invitationId },
        data: {
          status: status,
          respondedAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'Invitation declined'
      })
    }

  } catch (error) {
    console.error('Respond to invitation error:', error)
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'received' or 'sent'
    const status = searchParams.get('status') // 'pending', 'accepted', 'declined', etc.

    let invitations

    if (type === 'sent') {
      // Get invitations sent by this instructor
      const whereClause: any = {
        instructorId: decoded.userId
      }
      
      if (status) {
        whereClause.status = status.toUpperCase()
      }

      invitations = await prisma.classInvitation.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          class: {
            include: {
              activity: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  creditsRequired: true
                }
              }
            }
          }
        },
        orderBy: {
          invitedAt: 'desc'
        }
      })
    } else {
      // Get invitations received by this customer
      const whereClause: any = {
        customerId: decoded.userId
      }

      if (status) {
        whereClause.status = status.toUpperCase()
      } else {
        // Default to pending invitations for received type
        whereClause.status = 'PENDING'
        whereClause.expiresAt = {
          gt: new Date() // Only active invitations
        }
      }

      invitations = await prisma.classInvitation.findMany({
        where: whereClause,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true
            }
          },
          class: {
            include: {
              activity: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  creditsRequired: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: {
          invitedAt: 'desc'
        }
      })
    }

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
