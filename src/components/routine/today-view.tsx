'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoutineScore } from './routine-score'
import { TaskList } from './task-list'
import { AddTaskDialog } from './add-task-dialog'
import { HabitsTodayList } from './habits/habits-today-list'
import { useTasksToday } from '@/hooks/use-tasks'
import { useHabits } from '@/hooks/use-habits'
import { useHabitLogsToday } from '@/hooks/use-habit-logs'

export function TodayView() {
  const { data: tasksData, isLoading: tasksLoading } = useTasksToday()
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: habitLogs, isLoading: logsLoading } = useHabitLogsToday()

  const isLoading = tasksLoading || habitsLoading || logsLoading

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    )
  }

  // Calculate combined score (tasks + habits)
  const totalTasks = tasksData?.total ?? 0
  const completedTasks = tasksData?.completed ?? 0

  const totalHabits = habits?.length ?? 0
  const completedHabits = habitLogs?.filter(log => log.completed).length ?? 0

  const totalItems = totalTasks + totalHabits
  const completedItems = completedTasks + completedHabits

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rotina de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <RoutineScore completed={completedItems} total={totalItems} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Tarefas</CardTitle>
          <AddTaskDialog />
        </CardHeader>
        <CardContent>
          <TaskList tasks={tasksData?.tasks ?? []} />
        </CardContent>
      </Card>

      {habits && habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hábitos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <HabitsTodayList habits={habits} logs={habitLogs ?? []} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
