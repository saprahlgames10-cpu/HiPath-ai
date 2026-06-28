import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create a blank test user
  const user1 = await prisma.userProfile.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      displayName: 'New User',
      timezone: 'UTC',
      hoursPerWeekGoal: 5,
      onboardingCompleted: false,
    },
  })

  // 2. Create an active test user with a roadmap
  const user2 = await prisma.userProfile.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      displayName: 'Active Learner',
      timezone: 'UTC',
      hoursPerWeekGoal: 10,
      onboardingCompleted: true,
      currentStreak: 3,
      longestStreak: 5,
    },
  })

  // Create a Roadmap for user2
  const roadmap = await prisma.roadmap.create({
    data: {
      userId: user2.id,
      title: 'Become a Next.js Developer',
      goalText: 'I want to build full-stack web applications with Next.js and React.',
      timeline: 4,
      skillLevel: 'Beginner',
      status: 'ACTIVE',
      weeks: {
        create: [
          {
            weekNumber: 1,
            theme: 'React Fundamentals',
            status: 'IN_PROGRESS',
            lessons: {
              create: [
                {
                  title: 'React Components and Props',
                  description: 'Learn how to build reusable UI components.',
                  position: 1,
                  status: 'PASSED',
                  estimatedMins: 30,
                  masteryLevel: 'PASSED',
                },
                {
                  title: 'State and Lifecycle',
                  description: 'Understand how to manage component state.',
                  position: 2,
                  status: 'AVAILABLE',
                  estimatedMins: 45,
                }
              ]
            }
          },
          {
            weekNumber: 2,
            theme: 'Next.js App Router',
            status: 'LOCKED',
            lessons: {
              create: [
                {
                  title: 'Routing and Pages',
                  description: 'Learn how file-based routing works.',
                  position: 1,
                  status: 'LOCKED',
                  estimatedMins: 30,
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log({ user1, user2, roadmap })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
