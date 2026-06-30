import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Map, ArrowRight, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic';



export default async function RoadmapsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    include: {
      roadmaps: {
        orderBy: { createdAt: 'desc' },
        include: {
          weeks: true
        }
      }
    }
  })

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Map className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">My Roadmaps</h1>
            <p className="text-muted-foreground mt-1">Manage and track your learning journeys.</p>
          </div>
        </div>
        <Link href="/onboarding" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Roadmap
        </Link>
      </div>

      {profile.roadmaps.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Map className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-heading font-semibold mb-2">No roadmaps found</h2>
          <p className="text-muted-foreground mb-6">You haven&apos;t generated any learning roadmaps yet.</p>
          <Link href="/onboarding" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Generate your first roadmap
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.roadmaps.map((roadmap) => {
            const completedWeeks = roadmap.weeks.filter(w => w.status === 'COMPLETED').length
            const progress = Math.round((completedWeeks / roadmap.timeline) * 100)
            
            return (
              <Link key={roadmap.id} href={`/roadmap/${roadmap.id}`} className="block group">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {roadmap.title}
                    </h3>
                    <div className="p-2 bg-primary/5 rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{roadmap.skillLevel}</span>
                      <span className="font-medium">{roadmap.timeline} weeks</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
