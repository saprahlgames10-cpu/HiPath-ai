import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { CheckCircle2, Lock, PlayCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const prisma = new PrismaClient()

export default async function RoadmapViewerPage({ params }: { params: { id: string } }) {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: params.id },
    include: {
      weeks: {
        orderBy: { weekNumber: 'asc' },
        include: {
          lessons: {
            orderBy: { position: 'asc' },
            include: {
              resources: true
            }
          }
        }
      }
    }
  })

  if (!roadmap) {
    notFound()
  }

  // Calculate stats
  const totalLessons = roadmap.weeks.flatMap(w => w.lessons).length
  const completedLessons = roadmap.weeks.flatMap(w => w.lessons).filter(l => l.status === 'PASSED' || l.status === 'MASTERED').length
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const estimatedTimeRemaining = roadmap.weeks.flatMap(w => w.lessons).filter(l => l.status !== 'PASSED' && l.status !== 'MASTERED').reduce((acc, l) => acc + l.estimatedMins, 0)
  const remainingHours = Math.floor(estimatedTimeRemaining / 60)

  // Find active week (first week with available or in_progress lessons, or just week 1)
  const activeWeek = roadmap.weeks.find(w => w.status === 'IN_PROGRESS' || w.status === 'AVAILABLE') || roadmap.weeks[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{roadmap.title}</h1>
          <p className="text-muted-foreground mb-6">{roadmap.goalText}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background rounded-xl p-4 border flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="175.93" strokeDashoffset={175.93 - (175.93 * completionPercentage) / 100} className="text-primary transition-all duration-1000" />
                </svg>
                <span className="absolute text-sm font-bold">{completionPercentage}%</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Progress</p>
                <p className="font-medium">{completedLessons} of {totalLessons} lessons</p>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-info/10 text-info flex items-center justify-center">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Time Remaining</p>
                <p className="font-medium">~{remainingHours} hours</p>
              </div>
            </div>

            <div className="bg-background rounded-xl p-4 border flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Current Streak</p>
                <p className="font-medium">3 days</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Timeline */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex items-center min-w-max gap-4">
            {roadmap.weeks.map((week) => (
              <div key={week.id} className="flex flex-col items-center group cursor-pointer">
                <div className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-colors",
                  week.status === 'COMPLETED' ? "bg-success border-success text-success-foreground" :
                  week.status === 'IN_PROGRESS' || week.status === 'AVAILABLE' ? "bg-primary border-primary text-primary-foreground" :
                  "bg-card border-muted text-muted-foreground"
                )}>
                  {week.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{week.weekNumber}</span>}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Week {week.weekNumber}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Week View */}
        {activeWeek && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-2">Week {activeWeek.weekNumber}: {activeWeek.theme}</h2>
              <p className="text-muted-foreground text-lg">Focus on these concepts to build your foundation.</p>
            </div>

            <div className="space-y-4">
              {activeWeek.lessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className={cn(
                    "flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border transition-all",
                    lesson.status === 'LOCKED' ? "bg-muted/50 opacity-75" : "bg-card hover:border-primary shadow-sm"
                  )}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={cn("text-lg font-bold font-heading", lesson.status === 'LOCKED' && "text-muted-foreground")}>
                        {lesson.title}
                      </h3>
                      {lesson.status === 'PASSED' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">Passed</span>}
                      {lesson.status === 'MASTERED' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30">Mastered</span>}
                      {lesson.status === 'IN_PROGRESS' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">In Progress</span>}
                      {lesson.status === 'AVAILABLE' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">Available</span>}
                      {lesson.status === 'LOCKED' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {lesson.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 md:mt-0 ml-auto whitespace-nowrap">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold">{lesson.estimatedMins} mins</p>
                      <p className="text-xs text-muted-foreground">{lesson.resources.length} resources</p>
                    </div>
                    <button 
                      disabled={lesson.status === 'LOCKED'}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                      {lesson.status === 'PASSED' || lesson.status === 'MASTERED' ? 'Review' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
