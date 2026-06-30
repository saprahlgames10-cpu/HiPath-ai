import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrainCircuit } from 'lucide-react'

export const dynamic = 'force-dynamic';



export default async function WeaknessesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '00000000-0000-0000-0000-000000000002'

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: {
      weaknessLogs: {
        orderBy: { failureCount: 'desc' }
      }
    }
  })

  if (!profile) redirect('/login')

  const weaknesses = profile.weaknessLogs

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <header>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground">
            Focus Areas
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          These are the concepts you&apos;ve struggled with during quizzes. Reviewing them will improve your mastery.
        </p>
      </header>

      {weaknesses.length === 0 ? (
        <div className="bg-card rounded-2xl border p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You&apos;re doing great!</h2>
          <p className="text-muted-foreground">No weak concepts logged yet. Keep crushing those quizzes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weaknesses.map((weakness) => (
            <div key={weakness.id} className="bg-card border rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-heading mb-1">{weakness.conceptTag}</h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve missed questions on this {weakness.failureCount} time{weakness.failureCount !== 1 ? 's' : ''}.
                </p>
              </div>
              <div className="text-right flex items-center gap-6">
                <button className="bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors px-6 py-2.5 rounded-lg font-medium shadow-sm">
                  Review Concept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
