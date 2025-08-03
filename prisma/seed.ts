import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sbookyway.com' },
    update: {},
    create: {
      email: 'admin@sbookyway.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@sbookyway.com' },
    update: {},
    create: {
      email: 'instructor@sbookyway.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      bio: 'Certified yoga instructor with 10+ years of experience. Specializing in Hatha and Vinyasa yoga for all skill levels.',
      specialties: 'Yoga, Meditation, Mindfulness',
      experience: '10+ years of teaching yoga, founded three wellness studios, trained over 500 students worldwide',
      certifications: 'RYT-500 Yoga Alliance, Meditation Teacher Certification, Reiki Level 2',
      credits: 50,
    },
  })

  const instructor2 = await prisma.user.upsert({
    where: { email: 'mike.trainer@sbookyway.com' },
    update: {},
    create: {
      email: 'mike.trainer@sbookyway.com',
      name: 'Mike Thompson',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      bio: 'Personal trainer and fitness enthusiast with expertise in HIIT, strength training, and functional fitness.',
      specialties: 'HIIT, Strength Training, Functional Fitness',
      experience: '8 years in personal training, former competitive athlete, specialized in high-intensity workouts',
      certifications: 'NASM-CPT, ACSM Personal Trainer, TRX Certification, CrossFit Level 1',
      credits: 35,
    },
  })

  const instructor3 = await prisma.user.upsert({
    where: { email: 'emma.pilates@sbookyway.com' },
    update: {},
    create: {
      email: 'emma.pilates@sbookyway.com',
      name: 'Emma Rodriguez',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      bio: 'Pilates certified instructor focusing on core strength, flexibility, and rehabilitation exercises.',
      specialties: 'Pilates, Core Training, Rehabilitation',
      experience: '6 years specializing in Pilates, helped 200+ clients with injury recovery and fitness goals',
      certifications: 'PMA Certified Pilates Instructor, Physical Therapy Assistant, Mat Pilates Certification',
      credits: 40,
    },
  })

  const instructor4 = await prisma.user.upsert({
    where: { email: 'david.dance@sbookyway.com' },
    update: {},
    create: {
      email: 'david.dance@sbookyway.com',
      name: 'David Chen',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      bio: 'Professional dancer and choreographer teaching various dance styles from beginner to advanced levels.',
      specialties: 'Contemporary Dance, Hip-Hop, Choreography',
      experience: '12 years as professional performer and 5 years teaching, performed with major dance companies',
      certifications: 'Bachelor of Fine Arts in Dance, Certified Dance Educator, Hip-Hop Dance Alliance Member',
      credits: 25,
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: 'customer@sbookyway.com' },
    update: {},
    create: {
      email: 'customer@sbookyway.com',
      name: 'John Smith',
      password: hashedPassword,
      role: 'CUSTOMER',
      credits: 25,
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane.doe@sbookyway.com' },
    update: {},
    create: {
      email: 'jane.doe@sbookyway.com',
      name: 'Jane Doe',
      password: hashedPassword,
      role: 'CUSTOMER',
      credits: 15,
    },
  })

  // Create sample activities
  const yoga = await prisma.activity.upsert({
    where: { id: 'yoga-001' },
    update: {},
    create: {
      id: 'yoga-001',
      title: 'Hatha Yoga',
      description: 'Relaxing yoga sessions focusing on gentle poses and breathing techniques for all levels',
      category: 'Yoga',
      duration: 60,
      maxCapacity: 20,
      price: 2000, // $20 in cents
      creditsRequired: 2,
      instructorId: instructor.id,
    },
  })

  const advancedYoga = await prisma.activity.upsert({
    where: { id: 'yoga-002' },
    update: {},
    create: {
      id: 'yoga-002',
      title: 'Vinyasa Flow',
      description: 'Dynamic yoga practice linking breath with movement for intermediate to advanced practitioners',
      category: 'Yoga',
      duration: 75,
      maxCapacity: 15,
      price: 2500,
      creditsRequired: 3,
      instructorId: instructor.id,
    },
  })

  const hiit = await prisma.activity.upsert({
    where: { id: 'hiit-001' },
    update: {},
    create: {
      id: 'hiit-001',
      title: 'HIIT Bootcamp',
      description: 'High-intensity interval training for maximum calorie burn and fitness improvement',
      category: 'HIIT',
      duration: 45,
      maxCapacity: 12,
      price: 3000,
      creditsRequired: 3,
      instructorId: instructor2.id,
    },
  })

  const strength = await prisma.activity.upsert({
    where: { id: 'strength-001' },
    update: {},
    create: {
      id: 'strength-001',
      title: 'Functional Strength',
      description: 'Build real-world strength with compound movements and functional exercises',
      category: 'Strength',
      duration: 50,
      maxCapacity: 10,
      price: 2800,
      creditsRequired: 3,
      instructorId: instructor2.id,
    },
  })

  const pilates = await prisma.activity.upsert({
    where: { id: 'pilates-001' },
    update: {},
    create: {
      id: 'pilates-001',
      title: 'Mat Pilates',
      description: 'Core strengthening and flexibility training using bodyweight exercises on the mat',
      category: 'Pilates',
      duration: 45,
      maxCapacity: 15,
      price: 2500, // $25 in cents
      creditsRequired: 2,
      instructorId: instructor3.id,
    },
  })

  const reformerPilates = await prisma.activity.upsert({
    where: { id: 'pilates-002' },
    update: {},
    create: {
      id: 'pilates-002',
      title: 'Reformer Pilates',
      description: 'Advanced Pilates using reformer machines for resistance and precision training',
      category: 'Pilates',
      duration: 50,
      maxCapacity: 8,
      price: 4000,
      creditsRequired: 4,
      instructorId: instructor3.id,
    },
  })

  const dance = await prisma.activity.upsert({
    where: { id: 'dance-001' },
    update: {},
    create: {
      id: 'dance-001',
      title: 'Contemporary Dance',
      description: 'Expressive contemporary dance combining ballet, modern, and jazz techniques',
      category: 'Dance',
      duration: 60,
      maxCapacity: 20,
      price: 2200,
      creditsRequired: 2,
      instructorId: instructor4.id,
    },
  })

  const hipHop = await prisma.activity.upsert({
    where: { id: 'dance-002' },
    update: {},
    create: {
      id: 'dance-002',
      title: 'Hip-Hop Dance',
      description: 'Learn the latest hip-hop moves and choreography in a fun, energetic environment',
      category: 'Dance',
      duration: 55,
      maxCapacity: 25,
      price: 2000,
      creditsRequired: 2,
      instructorId: instructor4.id,
    },
  })

  // Create credit packages
  const package1 = await prisma.creditPackage.upsert({
    where: { id: 'pack-10' },
    update: {},
    create: {
      id: 'pack-10',
      name: '10 Credits Pack',
      credits: 10,
      price: 10000, // $100.00 in cents
      validityDays: 90,
    },
  })

  const package2 = await prisma.creditPackage.upsert({
    where: { id: 'pack-20' },
    update: {},
    create: {
      id: 'pack-20',
      name: '20 Credits Pack',
      credits: 20,
      price: 18000, // $180.00 in cents
      validityDays: 180,
    },
  })

  // Create sample classes for activities
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  // Yoga classes
  await prisma.class.create({
    data: {
      activityId: yoga.id,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
      location: 'Studio A',
    }
  })

  await prisma.class.create({
    data: {
      activityId: advancedYoga.id,
      startTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 10, 30),
      endTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 45),
      location: 'Studio A',
    }
  })

  // HIIT classes
  await prisma.class.create({
    data: {
      activityId: hiit.id,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 45),
      location: 'Gym Floor',
    }
  })

  // Pilates classes
  await prisma.class.create({
    data: {
      activityId: pilates.id,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 45),
      location: 'Studio B',
    }
  })

  // Dance classes
  await prisma.class.create({
    data: {
      activityId: dance.id,
      startTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 19, 0),
      endTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 20, 0),
      location: 'Dance Studio',
    }
  })

  // Create sample instructor subscriptions
  await prisma.instructorSubscription.upsert({
    where: {
      instructorId_customerId: {
        instructorId: instructor.id,
        customerId: customer.id
      }
    },
    update: {},
    create: {
      instructorId: instructor.id, // Sarah Johnson (Yoga)
      customerId: customer.id, // John Smith
    }
  })

  await prisma.instructorSubscription.upsert({
    where: {
      instructorId_customerId: {
        instructorId: instructor2.id,
        customerId: customer.id
      }
    },
    update: {},
    create: {
      instructorId: instructor2.id, // Mike Thompson (HIIT/Strength)
      customerId: customer.id, // John Smith
    }
  })

  await prisma.instructorSubscription.upsert({
    where: {
      instructorId_customerId: {
        instructorId: instructor3.id,
        customerId: customer2.id
      }
    },
    update: {},
    create: {
      instructorId: instructor3.id, // Emma Rodriguez (Pilates)
      customerId: customer2.id, // Jane Doe
    }
  })

  await prisma.instructorSubscription.upsert({
    where: {
      instructorId_customerId: {
        instructorId: instructor4.id,
        customerId: customer2.id
      }
    },
    update: {},
    create: {
      instructorId: instructor4.id, // David Chen (Dance)
      customerId: customer2.id, // Jane Doe
    }
  })

  // Create sample class invitations
  const yogaClass = await prisma.class.findFirst({
    where: { activityId: yoga.id }
  })

  if (yogaClass) {
    await prisma.classInvitation.upsert({
      where: {
        customerId_classId: {
          customerId: customer.id,
          classId: yogaClass.id
        }
      },
      update: {},
      create: {
        instructorId: instructor.id,
        customerId: customer.id,
        classId: yogaClass.id,
        message: "Hi John! I'd love to invite you to my Hatha Yoga class tomorrow morning. It's perfect for relaxation and mindfulness!",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('Test accounts created:')
  console.log('📧 Admin: admin@sbookyway.com / password123')
  console.log('📧 Instructor Sarah (Yoga): instructor@sbookyway.com / password123')
  console.log('📧 Instructor Mike (HIIT): mike.trainer@sbookyway.com / password123')
  console.log('📧 Instructor Emma (Pilates): emma.pilates@sbookyway.com / password123')
  console.log('📧 Instructor David (Dance): david.dance@sbookyway.com / password123')
  console.log('📧 Customer John: customer@sbookyway.com / password123')
  console.log('📧 Customer Jane: jane.doe@sbookyway.com / password123')
  console.log('🔔 Sample subscriptions and invitations created!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
