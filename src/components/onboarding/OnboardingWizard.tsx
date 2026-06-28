'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useOnboardingStore, 
  TimelineOption, 
  HoursOption, 
  LevelOption, 
  FormatOption 
} from '@/store/useOnboardingStore'
import { cn } from '@/lib/utils'
import { ArrowRight, Check, Loader2 } from 'lucide-react'

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    goal, setGoal,
    timeline, setTimeline,
    hoursPerWeek, setHoursPerWeek,
    level, setLevel,
    formats, toggleFormat
  } = useOnboardingStore()

  const handleNext = () => {
    if (step < 6) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleGenerate = async () => {
    setIsSubmitting(true)
    // Actually we just redirect to the loading page which handles the API call
    router.push('/onboarding/generating')
  }

  const isValidGoal = goal.length >= 10 && goal.length <= 200
  const canProceed = () => {
    switch (step) {
      case 1: return isValidGoal
      case 2: return timeline !== null
      case 3: return hoursPerWeek !== null
      case 4: return level !== null
      case 5: return formats.length > 0
      default: return true
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-12 md:py-24">
      {/* Progress Indicator */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-2 w-full mx-1 rounded-full transition-colors duration-300",
                s <= step ? "bg-primary" : "bg-muted"
              )} 
            />
          ))}
        </div>
        <p className="text-center text-sm font-medium text-muted-foreground">
          Step {step} of 6
        </p>
      </div>

      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-sm border p-8 md:p-12 min-h-[400px] flex flex-col relative overflow-hidden">
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">What do you want to learn?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Be specific. We will build your entire roadmap around this goal.
            </p>
            <textarea
              autoFocus
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Become a Python developer, learn UI design, understand machine learning..."
              className="w-full bg-background border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className={cn("text-xs", goal.length < 10 || goal.length > 200 ? "text-destructive" : "text-muted-foreground")}>
                {goal.length}/200 characters (min 10)
              </span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">What is your timeline?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Choose a realistic timeframe to reach your goal.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: '4_weeks', title: '4 Weeks', desc: 'A focused, intensive sprint.' },
                { id: '8_weeks', title: '8 Weeks', desc: 'A balanced, steady pace.' },
                { id: '12_weeks', title: '12 Weeks', desc: 'Deep dive into complex topics.' },
                { id: '6_months', title: '6 Months', desc: 'Significant skill transformation.' },
                { id: '12_months', title: '12 Months', desc: 'Mastery and career transition.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimeline(opt.id as TimelineOption)}
                  className={cn(
                    "flex flex-col items-start p-4 border rounded-xl transition-all text-left hover:border-primary",
                    timeline === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                  )}
                >
                  <span className="font-semibold text-lg">{opt.title}</span>
                  <span className="text-sm text-muted-foreground mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Hours per week?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              How much time can you realistically commit each week?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: '3_5', title: '3 - 5 hours', desc: 'About 30-45 mins a day' },
                { id: '5_10', title: '5 - 10 hours', desc: 'About 1-1.5 hours a day' },
                { id: '10_15', title: '10 - 15 hours', desc: 'About 2 hours a day' },
                { id: '15_plus', title: '15+ hours', desc: 'Part-time equivalent' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setHoursPerWeek(opt.id as HoursOption)}
                  className={cn(
                    "flex flex-col items-start p-4 border rounded-xl transition-all text-left hover:border-primary",
                    hoursPerWeek === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                  )}
                >
                  <span className="font-semibold text-lg">{opt.title}</span>
                  <span className="text-sm text-muted-foreground mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Current knowledge level?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Where are you starting from in this specific topic?
            </p>
            <div className="flex flex-col gap-4">
              {[
                { id: 'beginner', title: 'Complete Beginner', desc: 'I have no prior experience with this.' },
                { id: 'some_experience', title: 'Some Experience', desc: 'I know the basics but want to go deeper.' },
                { id: 'experienced', title: 'Experienced', desc: 'I am experienced in related areas and need advanced concepts.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLevel(opt.id as LevelOption)}
                  className={cn(
                    "flex flex-col items-start p-5 border rounded-xl transition-all text-left hover:border-primary",
                    level === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                  )}
                >
                  <span className="font-semibold text-lg">{opt.title}</span>
                  <span className="text-sm text-muted-foreground mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Preferred learning formats?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Select all the ways you learn best. (Select at least one)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'video', title: 'Video Tutorials' },
                { id: 'article', title: 'Written Articles' },
                { id: 'exercise', title: 'Hands-on Exercises' },
                { id: 'project', title: 'Projects' },
                { id: 'course', title: 'Interactive Courses' },
              ].map((opt) => {
                const isSelected = formats.includes(opt.id as FormatOption)
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleFormat(opt.id as FormatOption)}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-xl transition-all text-left hover:border-primary",
                      isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                    )}
                  >
                    <span className="font-semibold">{opt.title}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                    )}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 text-success mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Ready to go</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Here is what you told us. We will generate a personalized roadmap based on this.
            </p>
            
            <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4 mb-8">
              <div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Goal</span>
                <p className="text-lg font-medium">{goal}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timeline</span>
                  <p className="font-medium capitalize">{timeline?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Commitment</span>
                  <p className="font-medium capitalize">{hoursPerWeek?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Level</span>
                  <p className="font-medium capitalize">{level?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Formats</span>
                  <p className="font-medium capitalize">{formats.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="pt-8 mt-auto flex items-center justify-between border-t">
          {step > 1 ? (
            <button 
              onClick={handleBack}
              className="px-6 py-2 rounded-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              disabled={isSubmitting}
            >
              Back
            </button>
          ) : <div></div>}
          
          {step < 6 ? (
            <button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold text-lg transition-all hover:bg-primary/90 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Preparing...
                </>
              ) : (
                "Generate My Roadmap"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
