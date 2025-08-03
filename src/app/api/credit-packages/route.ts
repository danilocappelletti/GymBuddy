import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const creditPackages = await prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { credits: 'asc' }
    })

    return NextResponse.json(creditPackages)
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, description, credits, price, validityDays } = data

    const creditPackage = await prisma.creditPackage.create({
      data: {
        name,
        description,
        credits,
        price,
        validityDays: validityDays || 365
      }
    })

    return NextResponse.json(creditPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating credit package:', error)
    return NextResponse.json(
      { error: 'Failed to create credit package' },
      { status: 500 }
    )
  }
}
