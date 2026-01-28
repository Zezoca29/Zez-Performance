'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoutineScore } from '@/components/routine/routine-score'
import { TaskList } from '@/components/routine/task-list'
import { AddTaskDialog } from '@/components/routine/add-task-dialog'
import { useTasksToday } from '@/hooks/use-tasks'

export default function RoutinePage() {
  const { data, isLoading } = useTasksToday()

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-muted rounded-lg" />
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rotina de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <RoutineScore
            completed={data?.completed ?? 0}
            total={data?.total ?? 0}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Tarefas</CardTitle>
          <AddTaskDialog />
        </CardHeader>
        <CardContent>
          <TaskList tasks={data?.tasks ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
