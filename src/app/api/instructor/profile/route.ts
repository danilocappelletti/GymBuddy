import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// GET - Get instructor profile for editing
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const instructor = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        phone: true,
        experience: true,
        certifications: true,
      },
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    return NextResponse.json(instructor);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update instructor profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      bio, 
      specialties, 
      phone, 
      experience, 
      certifications 
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          id: decoded.userId
        }
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Email address is already in use' 
      }, { status: 400 });
    }

    // Update instructor profile
    const updatedInstructor = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        bio: bio?.trim() || null,
        specialties: specialties?.trim() || null,
        phone: phone?.trim() || null,
        experience: experience?.trim() || null,
        certifications: certifications?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        phone: true,
        experience: true,
        certifications: true,
      },
    });

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      instructor: updatedInstructor 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
