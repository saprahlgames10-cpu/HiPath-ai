'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, PlayCircle, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type Resource = {
  id: string
  title: string
  url: string
  type: string
  platform: string
  isPaid: boolean
  durationMins: number | null
}

type Lesson = {
  id: string
  title: string
  description: string | null
  estimatedMins: number
  resources: Resource[]
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter()
  const [completedResources, setCompletedResources] = useState<Set<string>>(new Set())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isAway, setIsAway] = useState(false)
  const awayStartTime = useRef<number | null>(null)

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAway) {
        setElapsedSeconds((prev) => prev + 1)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isAway])

  // Track away time via visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAway(true)
        awayStartTime.current = Date.now()
      } else {
        setIsAway(false)
        if (awayStartTime.current) {
          const awayTimeSeconds = Math.floor((Date.now() - awayStartTime.current) / 1000)
          setElapsedSeconds((prev) => prev + awayTimeSeconds)
          awayStartTime.current = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const toggleResource = (resourceId: string) => {
    const newSet = new Set(completedResources)
    if (newSet.has(resourceId)) {
      newSet.delete(resourceId)
    } else {
      newSet.add(resourceId)
    }
    setCompletedResources(newSet)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = ''
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    }
    return `https://www.youtube.com/embed/${videoId}`
  }

  const canTakeQuiz = completedResources.size > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground font-medium text-sm">
            &larr; Back to Roadmap
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Est. {lesson.estimatedMins} mins</span>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-mono text-sm font-bold flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isAway ? "bg-warning animate-pulse" : "bg-primary animate-pulse")} />
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-4">{lesson.title}</h1>
        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">{lesson.description}</p>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            Learning Resources
          </h2>

          {lesson.resources.map((resource) => {
            const isCompleted = completedResources.has(resource.id)
            const isYT = isYouTubeUrl(resource.url)

            return (
              <div 
                key={resource.id} 
                className={cn(
                  "border rounded-xl overflow-hidden transition-all duration-300 shadow-sm",
                  isCompleted ? "border-success bg-success/5" : "bg-card border-border hover:border-primary/50"
                )}
              >
                {/* Resource Header */}
                <div className="p-6 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                        {resource.type}
                      </span>
                      {resource.durationMins && (
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {resource.durationMins} mins
                        </span>
                      )}
                      {resource.isPaid && (
                        <span className="text-xs font-semibold text-warning bg-warning/10 px-2 py-1 rounded">
                          Paid
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">{resource.platform}</p>
                  </div>

                  <button 
                    onClick={() => toggleResource(resource.id)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                      isCompleted ? "bg-success border-success text-success-foreground" : "border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"
                    )}
                  >
                    <CheckCircle2 className={cn("w-6 h-6", isCompleted ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                  </button>
                </div>

                {/* Resource Content Body */}
                <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-background/50">
                  {isYT ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border bg-black mt-4">
                      <iframe 
                        src={getYouTubeEmbedUrl(resource.url)} 
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-4 bg-muted/50 p-4 rounded-lg border border-dashed">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <ExternalLink className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">External Resource</p>
                        <p className="text-sm text-muted-foreground mb-2">This content opens in a new tab. Your timer will continue tracking while you are away.</p>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                        >
                          Open {resource.platform} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Action */}
        <div className="mt-16 pt-8 border-t flex flex-col items-center text-center">
          <p className="text-muted-foreground mb-6">
            {!canTakeQuiz 
              ? "Review at least one resource to unlock the quiz."
              : "Ready to test your understanding?"}
          </p>
          <button 
            disabled={!canTakeQuiz}
            onClick={() => router.push(`/lesson/${lesson.id}/quiz`)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Take the Quiz <PlayCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
