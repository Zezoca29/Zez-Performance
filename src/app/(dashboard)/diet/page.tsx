'use client'

import { Apple } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DayStatusToggle } from '@/components/diet/day-status-toggle'
import { MealLog } from '@/components/diet/meal-log'
import { useDietToday } from '@/hooks/use-diet'

export default function DietPage() {
  const { data, isLoading } = useDietToday()

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-muted rounded-lg" />
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  }

  const statusLabel = data?.status === 'clean'
    ? 'Dia limpo'
    : data?.status === 'partial'
      ? 'Dia parcial'
      : data?.status === 'free'
        ? 'Dia livre'
        : 'Nao definido'

  const statusColor = data?.status === 'clean'
    ? 'text-primary'
    : data?.status === 'partial'
      ? 'text-yellow-500'
      : 'text-muted-foreground'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dieta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`p-4 rounded-full ${data?.status === 'clean' ? 'bg-primary/20' : 'bg-muted'}`}>
              <Apple className={`h-10 w-10 ${statusColor}`} />
            </div>
            <p className={`text-lg font-medium ${statusColor}`}>
              {statusLabel}
            </p>
          </div>
          <DayStatusToggle currentStatus={data?.status ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <MealLog logs={data?.logs ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
