'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export function KudosButton({ achievementId, initialCount }: { achievementId: string, initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleKudo = async () => {
    // Optimistic update
    setCount(c => c + 1)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    try {
      await fetch(`/api/achievements/${achievementId}/kudos`, { method: 'POST' })
    } catch (err) {
      console.error(err)
      // Revert on strict failure, but for kudos we can be lenient
    }
  }

  return (
    <button 
      onClick={handleKudo}
      className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors group"
    >
      <Heart className={cn("w-5 h-5 group-hover:fill-accent/20", isAnimating && "animate-ping fill-accent text-accent")} />
      <span className="font-medium text-sm">{count > 0 ? count : 'React'}</span>
    </button>
  )
}
