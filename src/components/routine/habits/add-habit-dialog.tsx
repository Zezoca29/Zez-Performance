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
import { Label } from '@/components/ui/label'
import { useCreateHabit } from '@/hooks/use-habits'
import { toast } from 'sonner'

const FREQUENCY_OPTIONS = [
  { value: 7, label: 'Todos os dias (7x)' },
  { value: 6, label: '6x por semana' },
  { value: 5, label: '5x por semana' },
  { value: 4, label: '4x por semana' },
  { value: 3, label: '3x por semana' },
  { value: 2, label: '2x por semana' },
  { value: 1, label: '1x por semana' },
]

export function AddHabitDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState(7)
  const [reminderTime, setReminderTime] = useState('')
  const [targetDays, setTargetDays] = useState(66)

  const createHabit = useCreateHabit()

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setFrequency(7)
    setReminderTime('')
    setTargetDays(66)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createHabit.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        frequency_per_week: frequency,
        reminder_time: reminderTime || null,
        target_days: targetDays,
      })
      toast.success('Hábito criado!')
      resetForm()
      setOpen(false)
    } catch {
      toast.error('Erro ao criar hábito')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Hábito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-title">Nome do hábito</Label>
            <Input
              id="habit-title"
              placeholder="Ex: Beber 2L de água"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-description">Descrição (opcional)</Label>
            <Input
              id="habit-description"
              placeholder="Ex: Manter hidratação durante o dia"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequência semanal</Label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    frequency === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-accent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-reminder">Horário de lembrete (opcional)</Label>
            <Input
              id="habit-reminder"
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-target">Meta de dias</Label>
            <div className="flex gap-2">
              {[21, 30, 66, 100].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTargetDays(days)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                    targetDays === days
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-accent'
                  }`}
                >
                  {days} dias
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              66 dias é o tempo médio para formar um hábito
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={createHabit.isPending}>
            {createHabit.isPending ? 'Criando...' : 'Criar hábito'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
