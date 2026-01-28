'use client'

import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WaterTracker } from '@/components/hydration/water-tracker'
import { QuickAddButtons } from '@/components/hydration/quick-add-buttons'
import { WeeklyChart } from '@/components/hydration/weekly-chart'
import { useHydrationToday, useDeleteHydration } from '@/hooks/use-hydration'
import { toast } from 'sonner'

export default function HydrationPage() {
  const { data, isLoading } = useHydrationToday()
  const deleteHydration = useDeleteHydration()

  const handleDelete = async (id: string) => {
    try {
      await deleteHydration.mutateAsync(id)
      toast.success('Registro removido')
    } catch {
      toast.error('Erro ao remover registro')
    }
  }

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-64 bg-muted rounded-lg" />
      <div className="h-32 bg-muted rounded-lg" />
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hidratacao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <WaterTracker current={data?.total ?? 0} goal={data?.goal ?? 2500} />
          <QuickAddButtons />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <WeeklyChart />
        </CardContent>
      </Card>

      {data?.logs && data.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registros de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.logs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <span className="font-medium">{log.amount_ml}ml</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {format(new Date(log.created_at), 'HH:mm')}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(log.id)}
                    disabled={deleteHydration.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
