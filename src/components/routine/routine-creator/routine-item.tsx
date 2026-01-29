'use client'

import { useState } from 'react'
import { Trash2, Clock, Calendar, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  useToggleRoutineTemplate,
  useDeleteRoutineTemplate,
} from '@/hooks/use-routine-templates'
import { toast } from 'sonner'
import type { RoutineTemplate } from '@/types/database'
import { EditRoutineDialog } from './edit-routine-dialog'

interface RoutineItemProps {
  template: RoutineTemplate
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function RoutineItem({ template }: RoutineItemProps) {
  const [editOpen, setEditOpen] = useState(false)
  const toggleTemplate = useToggleRoutineTemplate()
  const deleteTemplate = useDeleteRoutineTemplate()

  const handleToggle = async (is_active: boolean) => {
    try {
      await toggleTemplate.mutateAsync({ id: template.id, is_active })
    } catch {
      toast.error('Erro ao atualizar template')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTemplate.mutateAsync(template.id)
      toast.success('Template removido')
    } catch {
      toast.error('Erro ao remover template')
    }
  }

  const daysText = template.days_of_week
    .sort((a, b) => a - b)
    .map(d => DAY_NAMES[d])
    .join(', ')

  const formatTime = (time: string | null) => {
    if (!time) return ''
    return time.slice(0, 5) // HH:MM
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 border rounded-lg">
        <Switch
          checked={template.is_active}
          onCheckedChange={handleToggle}
          disabled={toggleTemplate.isPending}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{template.title}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysText}
            </span>
            {template.start_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {template.time_type === 'fixed'
                  ? formatTime(template.start_time)
                  : `${formatTime(template.start_time)} - ${formatTime(template.end_time)}`}
              </span>
            )}
            {template.category && (
              <span className="bg-muted px-1.5 py-0.5 rounded">
                {template.category}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleteTemplate.isPending}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <EditRoutineDialog
        template={template}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
