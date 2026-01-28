'use client'

import { useGymStats } from '@/hooks/use-gym'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Flame, TrendingUp } from 'lucide-react'

export function GymStats() {
  const { data, isLoading } = useGymStats()

  if (isLoading) {
    return <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  }

  const stats = [
    { label: 'Esta semana', value: data?.weekCount ?? 0, icon: Calendar },
    { label: 'Este mes', value: data?.monthCount ?? 0, icon: TrendingUp },
    { label: 'Streak', value: data?.streak ?? 0, icon: Flame },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 text-center">
            <stat.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
