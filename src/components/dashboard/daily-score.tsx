'use client'

import { ProgressRing } from '@/components/shared/progress-ring'
import { StreakBadge } from './streak-badge'

interface DailyScoreProps {
  score: number
  streak: number
}

export function DailyScore({ score, streak }: DailyScoreProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <ProgressRing progress={score} size={160} strokeWidth={12}>
        <div className="text-center">
          <span className="text-4xl font-bold text-foreground">{score}</span>
          <span className="text-lg text-muted-foreground">%</span>
        </div>
      </ProgressRing>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Score do dia</p>
        <StreakBadge count={streak} />
      </div>
    </div>
  )
}
