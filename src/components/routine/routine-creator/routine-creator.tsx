'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoutineList } from './routine-list'
import { AddRoutineDialog } from './add-routine-dialog'
import { useRoutineTemplates } from '@/hooks/use-routine-templates'

export function RoutineCreator() {
  const { data: templates, isLoading } = useRoutineTemplates()

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
            <CardTitle>Templates de Rotina</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configure tarefas que se repetem automaticamente
            </p>
          </div>
          <AddRoutineDialog />
        </CardHeader>
        <CardContent>
          <RoutineList templates={templates ?? []} />
        </CardContent>
      </Card>

      {templates && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekPreview templates={templates} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function WeekPreview({ templates }: { templates: { title: string; days_of_week: number[]; is_active: boolean; start_time: string | null }[] }) {
  const days = [
    { index: 0, name: 'Dom' },
    { index: 1, name: 'Seg' },
    { index: 2, name: 'Ter' },
    { index: 3, name: 'Qua' },
    { index: 4, name: 'Qui' },
    { index: 5, name: 'Sex' },
    { index: 6, name: 'Sáb' },
  ]

  const activeTemplates = templates.filter(t => t.is_active)

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => {
        const dayTemplates = activeTemplates
          .filter(t => t.days_of_week.includes(day.index))
          .sort((a, b) => {
            if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time)
            if (a.start_time && !b.start_time) return -1
            if (!a.start_time && b.start_time) return 1
            return 0
          })
        return (
          <div key={day.index} className="text-center">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {day.name}
            </div>
            <div className="min-h-[60px] bg-muted/30 rounded-md p-1 space-y-1">
              {dayTemplates.map((t, i) => (
                <div
                  key={i}
                  className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate"
                  title={t.title}
                >
                  {t.title}
                </div>
              ))}
              {dayTemplates.length === 0 && (
                <div className="text-xs text-muted-foreground">-</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
