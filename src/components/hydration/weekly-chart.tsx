'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useHydrationWeek } from '@/hooks/use-hydration'

export function WeeklyChart() {
  const { data: weekData, isLoading } = useHydrationWeek()
  const goal = 2500

  if (isLoading) {
    return <div className="h-40 animate-pulse bg-muted rounded-lg" />
  }

  const maxValue = Math.max(goal, ...(weekData?.map(d => d.total) ?? []))

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Ultima semana</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {weekData?.map((day) => {
          const height = (day.total / maxValue) * 100
          const isGoalMet = day.total >= goal

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative h-24 bg-muted rounded-t">
                <div
                  className={`absolute bottom-0 w-full rounded-t transition-all ${
                    isGoalMet ? 'bg-primary' : 'bg-primary/50'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(day.date), 'EEE', { locale: ptBR })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
