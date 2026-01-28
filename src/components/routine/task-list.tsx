'use client'

import { TaskItem } from './task-item'
import { useToggleTask, useDeleteTask } from '@/hooks/use-tasks'
import { toast } from 'sonner'
import type { Task } from '@/types/database'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()

  const handleToggle = async (id: string, is_completed: boolean) => {
    try {
      await toggleTask.mutateAsync({ id, is_completed })
    } catch {
      toast.error('Erro ao atualizar tarefa')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id)
      toast.success('Tarefa removida')
    } catch {
      toast.error('Erro ao remover tarefa')
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma tarefa para hoje
      </p>
    )
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={handleToggle}
          onDelete={handleDelete}
          disabled={toggleTask.isPending || deleteTask.isPending}
        />
      ))}
    </div>
  )
}
