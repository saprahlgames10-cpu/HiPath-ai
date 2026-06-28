'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/useOnboardingStore'

const STATUS_MESSAGES = [
  "Analyzing your goal...",
  "Mapping the skill prerequisites...",
  "Sequencing your learning path...",
  "Finding the best resources...",
  "Generating your quiz questions...",
  "Finalizing your roadmap..."
]

export default function GeneratingPage() {
  const router = useRouter()
  const { goal, timeline, hoursPerWeek, level, formats } = useOnboardingStore()
  const [statusIndex, setStatusIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const hasStarted = useRef(false)

  // Status message rotation
  useEffect(() => {
    if (error) return

    const interval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < STATUS_MESSAGES.length - 1) return prev + 1
        return prev
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [error])

  // API Call
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    if (!goal) {
      router.replace('/onboarding')
      return
    }

    async function generateRoadmap() {
      try {
        const response = await fetch('/api/roadmap/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal,
            timeline,
            hoursPerWeek,
            level,
            formats
          })
        })

        if (!response.ok) {
          throw new Error('Failed to generate roadmap')
        }

        const data = await response.json()
        
        // Redirect to the new roadmap viewer
        if (data.roadmapId) {
          router.push(`/roadmap/${data.roadmapId}`)
        } else {
          router.push('/dashboard')
        }
      } catch {
        setError('We encountered an issue while generating your roadmap. The AI might be currently overwhelmed.')
      }
    }

    generateRoadmap()
  }, [goal, timeline, hoursPerWeek, level, formats, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-1000">
        {!error ? (
          <>
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold text-foreground">
                Building Your Journey
              </h2>
              <p className="text-lg text-muted-foreground animate-pulse">
                {STATUS_MESSAGES[statusIndex]}
              </p>
            </div>
          </>
        ) : (
          <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Generation Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button 
              onClick={() => router.push('/onboarding')}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
