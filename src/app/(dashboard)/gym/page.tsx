'use client'

import { Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckInButton } from '@/components/gym/check-in-button'
import { GymStats } from '@/components/gym/gym-stats'
import { useGymToday } from '@/hooks/use-gym'

export default function GymPage() {
  const { data, isLoading } = useGymToday()

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-muted rounded-lg" />
      <div className="h-32 bg-muted rounded-lg" />
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Academia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className={`p-6 rounded-full ${data?.checkedIn ? 'bg-primary/20' : 'bg-muted'}`}>
              <Dumbbell className={`h-12 w-12 ${data?.checkedIn ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            {data?.checkedIn ? (
              <div className="text-center">
                <p className="text-lg font-medium text-primary">Treino de hoje feito!</p>
                <p className="text-sm text-muted-foreground">{data.workoutType}</p>
                {data.session?.duration_minutes && (
                  <p className="text-sm text-muted-foreground">{data.session.duration_minutes} minutos</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum treino registrado hoje</p>
            )}
          </div>
          <CheckInButton isCheckedIn={data?.checkedIn ?? false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estatisticas</CardTitle>
        </CardHeader>
        <CardContent>
          <GymStats />
        </CardContent>
      </Card>
    </div>
  )
}
