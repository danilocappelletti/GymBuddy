import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sbookyway.com' },
    update: {},
    create: {
      email: 'admin@sbookyway.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      credits: 0
    }
  })

  // Create instructor user
  const instructorPassword = await bcrypt.hash('instructor123', 12)
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@sbookyway.com' },
    update: {},
    create: {
      email: 'instructor@sbookyway.com',
      name: 'Sarah Johnson',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      credits: 0
    }
  })

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@sbookyway.com' },
    update: {},
    create: {
      email: 'customer@sbookyway.com',
      name: 'John Doe',
      password: customerPassword,
      role: 'CUSTOMER',
      credits: 18
    }
  })

  // Create credit packages
  const packages = [
    { name: 'Starter Pack', description: 'Perfect for trying out different classes', credits: 5, price: 2500, validityDays: 90 },
    { name: 'Regular Pack', description: 'Great for regular attendees', credits: 10, price: 4500, validityDays: 180 },
    { name: 'Premium Pack', description: 'Best value for fitness enthusiasts', credits: 25, price: 10000, validityDays: 365 },
    { name: 'Unlimited Monthly', description: 'Unlimited classes for one month', credits: 999, price: 15000, validityDays: 30 }
  ]

  for (const pkg of packages) {
    await prisma.creditPackage.create({
      data: pkg
    }).catch(() => {
      console.log(`Package ${pkg.name} already exists`)
    })
  }

  // Create activities
  const activities = [
    {
      title: 'Morning Yoga Flow',
      description: 'Start your day with gentle yoga movements and breathing exercises',
      category: 'Yoga',
      duration: 60,
      maxCapacity: 20,
      price: 0,
      creditsRequired: 1,
      instructorId: instructor.id
    },
    {
      title: 'HIIT Training',
      description: 'High-intensity interval training for maximum calorie burn',
      category: 'Fitness',
      duration: 45,
      maxCapacity: 15,
      price: 0,
      creditsRequired: 2,
      instructorId: instructor.id
    },
    {
      title: 'Pilates Core',
      description: 'Strengthen your core with targeted pilates exercises',
      category: 'Pilates',
      duration: 50,
      maxCapacity: 12,
      price: 0,
      creditsRequired: 1,
      instructorId: instructor.id
    }
  ]

  for (const activity of activities) {
    const createdActivity = await prisma.activity.create({
      data: activity
    }).catch(() => {
      console.log(`Activity ${activity.title} already exists`)
      return null
    })

    // Create some sample classes for each activity
    if (createdActivity) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      const classes = [
        {
          activityId: createdActivity.id,
          startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
          endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
          location: 'Studio A'
        },
        {
          activityId: createdActivity.id,
          startTime: new Date(nextWeek.setHours(18, 0, 0, 0)),
          endTime: new Date(nextWeek.setHours(19, 0, 0, 0)),
          location: 'Studio B'
        }
      ]

      for (const classData of classes) {
        await prisma.class.create({
          data: classData
        }).catch(() => {
          console.log(`Class for ${activity.title} already exists`)
        })
      }
    }
  }

  console.log({
    admin,
    instructor,
    customer,
    message: 'Database seeded successfully!'
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
