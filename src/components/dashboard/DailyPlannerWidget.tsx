'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, BookOpen, Clock, Loader2, Dumbbell, FolderGit2 } from 'lucide-react'
import { PlanItem } from '@/app/api/daily-plan/route'
import Link from 'next/link'

export function DailyPlannerWidget() {
  const [items, setItems] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlan()
  }, [])

  const fetchPlan = async () => {
    try {
      const res = await fetch('/api/daily-plan')
      const data = await res.json()
      if (data.plan) {
        setItems(data.plan.items as PlanItem[])
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = async (itemId: string, currentStatus: boolean) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: !currentStatus } : i))
    )

    try {
      const res = await fetch('/api/daily-plan/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, completed: !currentStatus }),
      })
      if (!res.ok) {
        throw new Error('Failed to update')
      }
    } catch (err) {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, completed: currentStatus } : i))
      )
    }
  }

  if (loading) {
    return (
      <Card className="col-span-full xl:col-span-1 shadow-sm h-full flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full xl:col-span-1 shadow-sm">
        <CardHeader>
          <CardTitle>Today's Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const completedCount = items.filter((i) => i.completed).length
  const totalCount = items.length
  const progressPercent = totalCount === 0 ? 0 : (completedCount / totalCount) * 100

  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Plan</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount} / {totalCount} completed
          </span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No plan for today. You deserve a break!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id}
                className={`group flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  item.completed ? 'bg-secondary/50 border-secondary' : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <button 
                  onClick={() => toggleItem(item.id, item.completed)}
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="shrink-0 text-muted-foreground">
                      {item.type === 'LESSON' && <BookOpen className="h-3.5 w-3.5" />}
                      {item.type === 'PRACTICE' && <Dumbbell className="h-3.5 w-3.5" />}
                      {item.type === 'PROJECT' && <FolderGit2 className="h-3.5 w-3.5" />}
                    </span>
                    <p className={`text-sm font-medium truncate ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground space-x-3">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {item.durationMins} min
                    </span>
                    {item.lessonId && (
                      <Link href={`/lesson/${item.lessonId}`} className="text-primary hover:underline">
                        Go to lesson
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
