'use client'

import { useState } from 'react'
import { Check, Flame, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToggleHabitLog } from '@/hooks/use-habit-logs'
import { useDeleteHabit, getHabitLevelInfo } from '@/hooks/use-habits'
import { toast } from 'sonner'
import type { Habit } from '@/types/database'
import { HabitProgress } from './habit-progress'
import { EditHabitDialog } from './edit-habit-dialog'

interface HabitCardProps {
  habit: Habit
  isCompletedToday: boolean
}

export function HabitCard({ habit, isCompletedToday }: HabitCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const toggleLog = useToggleHabitLog()
  const deleteHabit = useDeleteHabit()

  const levelInfo = getHabitLevelInfo(habit.level)

  const handleToggle = async () => {
    try {
      await toggleLog.mutateAsync({
        habitId: habit.id,
        completed: !isCompletedToday,
      })
      if (!isCompletedToday) {
        toast.success('Hábito completado!')
      }
    } catch {
      toast.error('Erro ao atualizar hábito')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteHabit.mutateAsync(habit.id)
      toast.success('Hábito removido')
    } catch {
      toast.error('Erro ao remover hábito')
    }
  }

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{habit.title}</h3>
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {habit.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
              disabled={deleteHabit.isPending}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Streak and Level */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-lg">{habit.current_streak}</span>
            <span className="text-sm text-muted-foreground">dias</span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
            <span>{levelInfo.emoji}</span>
            <span className="text-sm font-medium">{levelInfo.name}</span>
          </div>
        </div>

        {/* Progress bar */}
        <HabitProgress
          currentStreak={habit.current_streak}
          targetDays={habit.target_days}
          level={habit.level}
        />

        {/* Weekly frequency */}
        <div className="text-xs text-muted-foreground">
          Meta: {habit.frequency_per_week}x por semana
          {habit.longest_streak > 0 && (
            <span className="ml-2">
              | Melhor: {habit.longest_streak} dias
            </span>
          )}
        </div>

        {/* Complete button */}
        <Button
          onClick={handleToggle}
          disabled={toggleLog.isPending}
          variant={isCompletedToday ? 'secondary' : 'default'}
          className="w-full"
        >
          {isCompletedToday ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Completado hoje
            </>
          ) : (
            'Marcar como feito'
          )}
        </Button>
      </div>

      <EditHabitDialog
        habit={habit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
