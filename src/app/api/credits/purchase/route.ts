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

    const { creditPackageId } = await request.json()

    if (!creditPackageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Define credit packages (in a real app, this would be in the database)
    const creditPackages = {
      1: { credits: 10, price: 25 },
      2: { credits: 25, price: 60 },
      3: { credits: 50, price: 100 },
      4: { credits: 100, price: 150 }
    }

    const selectedPackage = creditPackages[creditPackageId as keyof typeof creditPackages]
    
    if (!selectedPackage) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 })
    }

    // Simulate payment processing (2 second delay)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Add credits to user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        credits: {
          increment: selectedPackage.credits
        }
      }
    })

    // Create transaction record
    await prisma.creditTransaction.create({
      data: {
        userId: decoded.userId,
        type: 'PURCHASE',
        amount: selectedPackage.credits,
        description: `Purchased ${selectedPackage.credits} credits for $${selectedPackage.price}`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${selectedPackage.credits} credits!`,
      newBalance: updatedUser.credits
    })

  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
