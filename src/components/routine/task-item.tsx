'use client'

import { Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, is_completed: boolean) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

export function TaskItem({ task, onToggle, onDelete, disabled }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
        disabled={disabled}
      />
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm',
            task.is_completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </span>
        {task.scheduled_time && (
          <span className={cn(
            'block text-xs text-muted-foreground',
            task.is_completed && 'line-through'
          )}>
            {task.scheduled_time.slice(0, 5)}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}
