'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitsList } from './habits-list'
import { AddHabitDialog } from './add-habit-dialog'
import { useHabits } from '@/hooks/use-habits'
import { useHabitLogsToday } from '@/hooks/use-habit-logs'

export function HabitsView() {
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: logs, isLoading: logsLoading } = useHabitLogsToday()

  const isLoading = habitsLoading || logsLoading

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Meus Hábitos</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe seus hábitos e construa consistência
            </p>
          </div>
          <AddHabitDialog />
        </CardHeader>
        <CardContent>
          <HabitsList habits={habits ?? []} logs={logs ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
