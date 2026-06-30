import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Flame, PlayCircle, Map, BrainCircuit, ArrowRight } from 'lucide-react'
import { WeeklyGoalChart } from '@/components/dashboard/WeeklyGoalChart'
import { DailyPlannerWidget } from '@/components/dashboard/DailyPlannerWidget'

export const dynamic = 'force-dynamic';



function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '00000000-0000-0000-0000-000000000002'

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: {
      roadmaps: {
        where: { status: 'ACTIVE' },
        include: {
          weeks: {
            orderBy: { weekNumber: 'asc' },
            include: {
              lessons: {
                orderBy: { position: 'asc' }
              }
            }
          }
        }
      },
      weaknessLogs: {
        orderBy: { failureCount: 'desc' },
        take: 3
      }
    }
  })

  if (!profile) {
    redirect('/login')
  }

  const activeRoadmap = profile.roadmaps[0] ?? null

  // Find the first non-completed lesson
  let nextLesson: (typeof activeRoadmap extends null ? never : typeof activeRoadmap.weeks[0]['lessons'][0]) | null = null
  let nextLessonWeek: (typeof activeRoadmap extends null ? never : typeof activeRoadmap.weeks[0]) | null = null

  if (activeRoadmap) {
    for (const week of activeRoadmap.weeks) {
      const pending = week.lessons.find(
        (l) => l.status === 'AVAILABLE' || l.status === 'IN_PROGRESS' || l.status === 'FAILED'
      )
      if (pending) {
        nextLesson = pending
        nextLessonWeek = week
        break
      }
    }
  }

  // Calculate Roadmap Progress
  let totalLessons = 0
  let completedLessons = 0
  if (activeRoadmap) {
    const allLessons = activeRoadmap.weeks.flatMap((w) => w.lessons)
    totalLessons = allLessons.length
    completedLessons = allLessons.filter(
      (l) => l.status === 'PASSED' || l.status === 'MASTERED'
    ).length
  }
  const roadmapProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const displayName = profile.displayName ?? 'Learner'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-heading font-bold text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-muted-foreground text-lg mt-2">Ready to continue your learning journey?</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2/3 width) - Focus and Roadmaps */}
        <div className="lg:col-span-2 space-y-8">

          <section>
            <DailyPlannerWidget />
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary" /> Daily Focus
            </h2>
            {nextLesson ? (
              <div className="bg-card rounded-2xl border p-6 shadow-sm hover:border-primary/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                      {activeRoadmap?.title} &bull; Week {nextLessonWeek?.weekNumber}
                    </p>
                    <h3 className="text-2xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">{nextLesson.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-6">{nextLesson.description}</p>
                  </div>
                  <div className="bg-muted px-3 py-1 rounded text-sm font-medium whitespace-nowrap text-muted-foreground">
                    ~{nextLesson.estimatedMins} mins
                  </div>
                </div>
                <Link href={`/lesson/${nextLesson.id}`}>
                  <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-all hover:bg-primary/90 shadow-sm w-full md:w-auto justify-center">
                    Resume Learning <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border p-8 shadow-sm text-center">
                <p className="text-muted-foreground mb-4">You have completed all active lessons or do not have an active roadmap.</p>
                <Link href="/onboarding">
                  <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium">
                    Generate New Roadmap
                  </button>
                </Link>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" /> Active Roadmap
            </h2>
            {activeRoadmap ? (
              <div className="bg-card rounded-2xl border p-6 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{activeRoadmap.title}</h3>
                    <p className="text-sm text-muted-foreground">{completedLessons} of {totalLessons} lessons completed</p>
                  </div>
                  <Link href={`/roadmap/${activeRoadmap.id}`} className="text-sm font-medium text-primary hover:underline">
                    View full map &rarr;
                  </Link>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${roadmapProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border p-6 shadow-sm text-muted-foreground text-sm">
                No active roadmaps found.
              </div>
            )}
          </section>
        </div>

        {/* Right Column (1/3 width) - Metrics and Weaknesses */}
        <div className="space-y-8">

          <section className="bg-card rounded-2xl border shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Flame className="w-24 h-24 text-accent" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Current Streak</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-heading font-bold text-accent">{profile.currentStreak}</span>
              <span className="text-muted-foreground font-medium">days</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Longest streak: {profile.longestStreak} days</p>
          </section>

          <section className="bg-card rounded-2xl border shadow-sm p-6 text-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Weekly Goal</h2>
            <WeeklyGoalChart hoursCompleted={3} hoursGoal={profile.hoursPerWeekGoal} />
            <p className="text-sm text-muted-foreground mt-4">
              You&apos;ve studied <strong>3 hours</strong> this week. Keep it up!
            </p>
          </section>

          {profile.weaknessLogs.length > 0 && (
            <section className="bg-card rounded-2xl border shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Focus Areas
                </h2>
                <Link href="/weaknesses" className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {profile.weaknessLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{log.conceptTag}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      {log.failureCount}x missed
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
