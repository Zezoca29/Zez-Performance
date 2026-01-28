'use client'

import { Droplets } from 'lucide-react'
import { ProgressRing } from '@/components/shared/progress-ring'

interface WaterTrackerProps {
  current: number
  goal: number
}

export function WaterTracker({ current, goal }: WaterTrackerProps) {
  const percentage = Math.min(100, Math.round((current / goal) * 100))

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <ProgressRing progress={percentage} size={180} strokeWidth={14}>
        <div className="text-center">
          <Droplets className="h-8 w-8 text-primary mx-auto mb-2" />
          <span className="text-3xl font-bold">{current}</span>
          <span className="text-lg text-muted-foreground">/{goal}ml</span>
        </div>
      </ProgressRing>
      <p className="text-sm text-muted-foreground">
        {percentage >= 100
          ? 'Meta atingida!'
          : `Faltam ${goal - current}ml para a meta`}
      </p>
    </div>
  )
}
