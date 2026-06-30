import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { PlanItem } from '../route'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, completed } = await req.json()
    if (!itemId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Missing itemId or completed flag' }, { status: 400 })
    }

    const userId = user.id
    
    // Find today's plan
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

    if (!existingPlan) {
      return NextResponse.json({ error: 'No plan found for today' }, { status: 404 })
    }

    // Update the item
    let allCompleted = true
    const updatedItems = (existingPlan.items as any as PlanItem[]).map((item) => {
      if (item.id === itemId) {
        item.completed = completed
      }
      if (!item.completed) {
        allCompleted = false
      }
      return item
    })

    const updatedPlan = await prisma.dailyPlan.update({
      where: { id: existingPlan.id },
      data: {
        items: updatedItems as any,
        isCompleted: allCompleted,
      },
    })

    return NextResponse.json({ success: true, plan: updatedPlan })
  } catch (error: any) {
    console.error('Failed to update daily plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
