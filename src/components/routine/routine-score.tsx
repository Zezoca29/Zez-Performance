'use client'

import { CheckCircle } from 'lucide-react'
import { ProgressRing } from '@/components/shared/progress-ring'

interface RoutineScoreProps {
  completed: number
  total: number
}

export function RoutineScore({ completed, total }: RoutineScoreProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <ProgressRing progress={percentage} size={140} strokeWidth={10}>
        <div className="text-center">
          <CheckCircle className="h-6 w-6 text-primary mx-auto mb-1" />
          <span className="text-2xl font-bold">{completed}</span>
          <span className="text-lg text-muted-foreground">/{total}</span>
        </div>
      </ProgressRing>
      <p className="text-sm text-muted-foreground">
        {percentage === 100
          ? 'Todas as tarefas completadas!'
          : `${percentage}% completado`}
      </p>
    </div>
  )
}
