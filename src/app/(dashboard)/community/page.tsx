import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, Trophy, Users } from 'lucide-react'
import { KudosButton } from '@/components/dashboard/KudosButton'

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient()

export default async function CommunityFeedPage() {
  const achievements = await prisma.userAchievement.findMany({
    take: 50,
    orderBy: { earnedAt: 'desc' },
    include: {
      achievement: true,
      user: true
    }
  })

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground">Community Feed</h1>
          <p className="text-muted-foreground text-lg mt-2">Celebrate the wins of your fellow learners.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-card border px-4 py-2 rounded-lg">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-medium">2,401 Active Learners</span>
        </div>
      </header>

      <div className="space-y-6">
        {achievements.length === 0 ? (
          <div className="text-center p-12 bg-card rounded-2xl border">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">It&apos;s quiet in here</h2>
            <p className="text-muted-foreground">Be the first to hit a milestone and show up on the feed!</p>
          </div>
        ) : (
          achievements.map(({ achievement, user, earnedAt, id }) => (
            <div key={id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <Link href={`/profile/${user.id}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg hover:bg-primary/20 transition-colors cursor-pointer">
                    {(user.displayName ?? 'A').charAt(0).toUpperCase()}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <Link href={`/profile/${user.id}`} className="font-bold hover:underline">
                      {user.displayName ?? 'Anonymous Learner'}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="mt-3 p-4 bg-muted/50 rounded-xl border flex items-start gap-3">
                    <div className="text-success mt-0.5">
                      {achievement.iconUrl === 'CheckCircle' ? <CheckCircle className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold font-heading">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-6">
                    <KudosButton achievementId={achievement.id} initialCount={achievement.kudosCount} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
