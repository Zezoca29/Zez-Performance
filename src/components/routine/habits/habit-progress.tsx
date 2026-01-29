'use client'

import { Progress } from '@/components/ui/progress'

interface HabitProgressProps {
  currentStreak: number
  targetDays: number
  level: number
}

const LEVEL_MILESTONES = [
  { level: 1, days: 7, name: 'Formando', color: 'bg-blue-500' },
  { level: 2, days: 21, name: 'Consolidando', color: 'bg-purple-500' },
  { level: 3, days: 66, name: 'Mestre', color: 'bg-yellow-500' },
]

export function HabitProgress({ currentStreak, targetDays, level }: HabitProgressProps) {
  // Calculate progress percentage towards target
  const progressPercent = Math.min(100, Math.round((currentStreak / targetDays) * 100))

  // Get next milestone
  const nextMilestone = LEVEL_MILESTONES.find(m => currentStreak < m.days)
  const currentMilestone = LEVEL_MILESTONES.findLast(m => currentStreak >= m.days)

  // Calculate progress towards next milestone
  let milestoneProgress = 0
  if (nextMilestone) {
    const prevDays = currentMilestone ? currentMilestone.days : 0
    const daysInThisLevel = currentStreak - prevDays
    const daysNeeded = nextMilestone.days - prevDays
    milestoneProgress = Math.round((daysInThisLevel / daysNeeded) * 100)
  } else {
    milestoneProgress = 100
  }

  return (
    <div className="space-y-2">
      {/* Main progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso para meta</span>
          <span>{currentStreak}/{targetDays} dias</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Milestone markers */}
      <div className="relative h-2 bg-muted rounded-full">
        {/* Progress fill */}
        <div
          className="absolute h-full bg-primary rounded-full transition-all"
          style={{ width: `${milestoneProgress}%` }}
        />

        {/* Milestone dots */}
        {LEVEL_MILESTONES.map((milestone, i) => {
          const position = (milestone.days / targetDays) * 100
          const isReached = currentStreak >= milestone.days

          return (
            <div
              key={milestone.days}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${Math.min(position, 100)}%` }}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 border-background ${
                  isReached ? milestone.color : 'bg-muted'
                }`}
              />
            </div>
          )
        })}
      </div>

      {/* Milestone labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className={level >= 2 ? 'text-blue-500 font-medium' : ''}>7d</span>
        <span className={level >= 3 ? 'text-purple-500 font-medium' : ''}>21d</span>
        <span className={level >= 4 ? 'text-yellow-500 font-medium' : ''}>66d</span>
      </div>

      {/* Next milestone info */}
      {nextMilestone && (
        <p className="text-xs text-center text-muted-foreground">
          Faltam <span className="font-medium text-foreground">{nextMilestone.days - currentStreak}</span> dias para {nextMilestone.name}
        </p>
      )}
      {!nextMilestone && level >= 4 && (
        <p className="text-xs text-center text-yellow-500 font-medium">
          Parabéns! Hábito formado!
        </p>
      )}
    </div>
  )
}
