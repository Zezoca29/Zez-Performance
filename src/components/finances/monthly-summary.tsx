'use client'

import { useMonthlyExpenses } from '@/hooks/use-finances'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function MonthlySummary() {
  const { data, isLoading } = useMonthlyExpenses()

  if (isLoading) {
    return <div className="space-y-4">
      <div className="h-20 bg-muted rounded animate-pulse" />
      <div className="h-32 bg-muted rounded animate-pulse" />
    </div>
  }

  const maxCategory = Math.max(...(data?.byCategory.map(c => c.total) ?? [1]))

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total do mes</p>
          <p className="text-3xl font-bold">R$ {(data?.total ?? 0).toFixed(2)}</p>
        </CardContent>
      </Card>

      {data?.byCategory && data.byCategory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Por categoria</h4>
          {data.byCategory.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{cat.name}</span>
                <span className="font-medium">R$ {cat.total.toFixed(2)}</span>
              </div>
              <Progress
                value={(cat.total / maxCategory) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
