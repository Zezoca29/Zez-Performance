'use client'

import { RoutineItem } from './routine-item'
import type { RoutineTemplate } from '@/types/database'

interface RoutineListProps {
  templates: RoutineTemplate[]
}

export function RoutineList({ templates }: RoutineListProps) {
  if (templates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum template de rotina criado.
        <br />
        Crie templates para gerar tarefas automaticamente.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {templates.map(template => (
        <RoutineItem key={template.id} template={template} />
      ))}
    </div>
  )
}
