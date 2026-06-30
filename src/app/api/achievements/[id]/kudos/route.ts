import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const achievementId = params.id
    
    // We increment the kudos count atomically
    const updatedAchievement = await prisma.achievement.update({
      where: { id: achievementId },
      data: {
        kudosCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ kudosCount: updatedAchievement.kudosCount }, { status: 200 })
  } catch (error) {
    console.error('Error adding kudo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
