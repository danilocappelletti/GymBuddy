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
    const { title, description, category, duration, maxCapacity, price, creditsRequired } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        category,
        duration: parseInt(duration) || 60,
        maxCapacity: parseInt(maxCapacity) || 20,
        price: parseInt(price) || 2000,
        creditsRequired: parseInt(creditsRequired) || 1,
        instructorId: decoded.userId
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get token from cookies 
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    console.log('Instructor API: Checking auth token:', token ? 'Token found' : 'No token found')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token
    console.log('Instructor API: Verifying token with secret:', JWT_SECRET ? 'Secret found' : 'No secret')
    const decoded = jwt.verify(token.value, JWT_SECRET) as any
    
    console.log('Instructor API: Decoded token:', { userId: decoded.userId, role: decoded.role })

    if (!decoded.userId || decoded.role !== 'INSTRUCTOR') {
      console.log('Instructor API: Access denied - not an instructor')
      return NextResponse.json(
        { error: 'Instructor access required' },
        { status: 403 }
      )
    }

    // Get instructor's activities
    const activities = await prisma.activity.findMany({
      where: { 
        instructorId: decoded.userId,
        isActive: true
      },
      include: {
        classes: {
          where: { isActive: true },
          orderBy: { startTime: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching instructor activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
