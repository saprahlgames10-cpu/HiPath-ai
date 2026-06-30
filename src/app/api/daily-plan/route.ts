import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export type PlanItem = {
  id: string
  type: 'LESSON' | 'PRACTICE' | 'PROJECT'
  title: string
  durationMins: number
  lessonId?: string
  completed: boolean
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Check for an existing plan today (in UTC)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

    const existingPlan = await prisma.dailyPlan.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (existingPlan) {
      return NextResponse.json({ plan: existingPlan })
    }

    // No plan for today, let's generate one
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Calculate daily target (approximate, e.g. 5 hours a week = ~42 mins a day)
    const dailyTargetMins = Math.max(30, Math.round((userProfile.hoursPerWeekGoal * 60) / 7))
    let allocatedMins = 0
    const planItems: PlanItem[] = []

    // Fetch active roadmaps
    const activeRoadmaps = await prisma.roadmap.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        weeks: {
          include: {
            lessons: {
              where: {
                status: { in: ['AVAILABLE', 'IN_PROGRESS', 'LOCKED'] }, // Include LOCKED so we can project the next ones
              },
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { weekNumber: 'asc' }
        }
      }
    })

    // Grab lessons until target is hit
    for (const roadmap of activeRoadmaps) {
      for (const week of roadmap.weeks) {
        for (const lesson of week.lessons) {
          if (allocatedMins >= dailyTargetMins) break
          
          planItems.push({
            id: `plan-item-${lesson.id}`,
            type: 'LESSON',
            title: lesson.title,
            durationMins: lesson.estimatedMins || 30,
            lessonId: lesson.id,
            completed: false,
          })
          
          allocatedMins += (lesson.estimatedMins || 30)
        }
        if (allocatedMins >= dailyTargetMins) break
      }
      if (allocatedMins >= dailyTargetMins) break
    }

    // Add a generic practice item if we still have time or just as a capstone
    if (planItems.length > 0 && allocatedMins < dailyTargetMins) {
      planItems.push({
        id: `plan-item-practice-${Date.now()}`,
        type: 'PRACTICE',
        title: 'Review & Practice Concepts',
        durationMins: dailyTargetMins - allocatedMins,
        completed: false,
      })
    }

    // If no active roadmaps have lessons, just provide a default placeholder plan
    if (planItems.length === 0) {
      planItems.push({
        id: `plan-item-explore`,
        type: 'PROJECT',
        title: 'Explore new Roadmaps',
        durationMins: 30,
        completed: false,
      })
    }

    // Create the daily plan
    const newPlan = await prisma.dailyPlan.create({
      data: {
        userId,
        date: today,
        items: planItems as any,
        isCompleted: false,
      },
    })

    return NextResponse.json({ plan: newPlan })
  } catch (error: any) {
    console.error('Failed to generate daily plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
