'use client'

import { HabitCard } from './habit-card'
import type { Habit, HabitLog } from '@/types/database'

interface HabitsListProps {
  habits: Habit[]
  logs: HabitLog[]
}

export function HabitsList({ habits, logs }: HabitsListProps) {
  if (habits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum hábito criado.
        <br />
        Comece criando um hábito para acompanhar.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {habits.map(habit => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isCompletedToday={logs.some(
            log => log.habit_id === habit.id && log.completed
          )}
        />
      ))}
    </div>
  )
}
