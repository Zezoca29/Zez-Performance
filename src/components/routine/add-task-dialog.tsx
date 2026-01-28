'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAddTask } from '@/hooks/use-tasks'
import { toast } from 'sonner'

export function AddTaskDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const addTask = useAddTask()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await addTask.mutateAsync(title)
      toast.success('Tarefa adicionada')
      setTitle('')
      setOpen(false)
    } catch {
      toast.error('Erro ao adicionar tarefa')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova tarefa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="O que voce precisa fazer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={addTask.isPending}>
            {addTask.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
