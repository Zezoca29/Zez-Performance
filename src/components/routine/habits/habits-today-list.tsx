'use client'

import { Check, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToggleHabitLog } from '@/hooks/use-habit-logs'
import { getHabitLevelInfo } from '@/hooks/use-habits'
import { toast } from 'sonner'
import type { Habit, HabitLog } from '@/types/database'

interface HabitsTodayListProps {
  habits: Habit[]
  logs: HabitLog[]
}

export function HabitsTodayList({ habits, logs }: HabitsTodayListProps) {
  const toggleLog = useToggleHabitLog()

  const handleToggle = async (habitId: string, isCompleted: boolean) => {
    try {
      await toggleLog.mutateAsync({
        habitId,
        completed: !isCompleted,
      })
      if (!isCompleted) {
        toast.success('Hábito completado!')
      }
    } catch {
      toast.error('Erro ao atualizar hábito')
    }
  }

  if (habits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum hábito para hoje
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {habits.map(habit => {
        const isCompleted = logs.some(
          log => log.habit_id === habit.id && log.completed
        )
        const levelInfo = getHabitLevelInfo(habit.level)

        return (
          <div
            key={habit.id}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <Button
              variant={isCompleted ? 'secondary' : 'outline'}
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleToggle(habit.id, isCompleted)}
              disabled={toggleLog.isPending}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {habit.title}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{habit.current_streak}</span>
              </div>
              <span className="text-sm" title={levelInfo.description}>
                {levelInfo.emoji}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
