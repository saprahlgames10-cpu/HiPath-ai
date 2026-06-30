import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Flame, Map, Trophy, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic';



export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const profileId = params.username

  const publicProfile = await prisma.communityPublicProfile.findUnique({
    where: { id: profileId },
    include: {
      user: {
        include: {
          roadmaps: true,
          userAchievements: {
            include: { achievement: true },
            orderBy: { earnedAt: 'desc' }
          }
        }
      }
    }
  })

  if (!publicProfile) notFound()

  const user = publicProfile.user
  const roadmapsCompleted = user.roadmaps.filter((r) => r.status === 'COMPLETED').length
  const totalRoadmaps = user.roadmaps.length
  const displayName = user.displayName ?? 'Anonymous Learner'

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">

      {/* Profile Header */}
      <div className="bg-card rounded-2xl border p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        <div className="w-32 h-32 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-5xl">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-heading font-bold mb-2">{displayName}</h1>
          {publicProfile.bio && (
            <p className="text-lg text-muted-foreground mb-4">{publicProfile.bio}</p>
          )}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined recently</span>
            <span className="flex items-center gap-1.5"><Map className="w-4 h-4" /> {totalRoadmaps} Roadmaps created</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <Flame className="w-8 h-8 text-accent mb-2" />
          <p className="text-3xl font-heading font-bold">{user.currentStreak}</p>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">Day Streak</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <Trophy className="w-8 h-8 text-success mb-2" />
          <p className="text-3xl font-heading font-bold">{user.userAchievements.length}</p>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">Milestones</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <Map className="w-8 h-8 text-primary mb-2" />
          <p className="text-3xl font-heading font-bold">{roadmapsCompleted}</p>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">Roadmaps Completed</p>
        </div>
      </div>

      {/* Achievements Wall */}
      <div>
        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" /> Milestone Wall
        </h2>

        {user.userAchievements.length === 0 ? (
          <div className="text-center p-12 bg-card rounded-2xl border">
            <p className="text-muted-foreground">This learner hasn&apos;t hit any major milestones yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.userAchievements.map(({ achievement, earnedAt, id }) => (
              <div key={id} className="bg-card border rounded-xl p-4 flex gap-4 items-start shadow-sm hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-1">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-heading leading-tight mb-1">{achievement.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 w-fit px-2 py-1 rounded">
                    &hearts; {achievement.kudosCount} Kudos
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
