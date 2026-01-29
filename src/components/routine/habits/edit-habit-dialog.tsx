'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateHabit } from '@/hooks/use-habits'
import { toast } from 'sonner'
import type { Habit } from '@/types/database'

const FREQUENCY_OPTIONS = [
  { value: 7, label: 'Todos os dias (7x)' },
  { value: 6, label: '6x por semana' },
  { value: 5, label: '5x por semana' },
  { value: 4, label: '4x por semana' },
  { value: 3, label: '3x por semana' },
  { value: 2, label: '2x por semana' },
  { value: 1, label: '1x por semana' },
]

interface EditHabitDialogProps {
  habit: Habit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditHabitDialog({ habit, open, onOpenChange }: EditHabitDialogProps) {
  const [title, setTitle] = useState(habit.title)
  const [description, setDescription] = useState(habit.description ?? '')
  const [frequency, setFrequency] = useState(habit.frequency_per_week)
  const [reminderTime, setReminderTime] = useState(habit.reminder_time?.slice(0, 5) ?? '')
  const [targetDays, setTargetDays] = useState(habit.target_days)

  const updateHabit = useUpdateHabit()

  useEffect(() => {
    setTitle(habit.title)
    setDescription(habit.description ?? '')
    setFrequency(habit.frequency_per_week)
    setReminderTime(habit.reminder_time?.slice(0, 5) ?? '')
    setTargetDays(habit.target_days)
  }, [habit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await updateHabit.mutateAsync({
        id: habit.id,
        title: title.trim(),
        description: description.trim() || null,
        frequency_per_week: frequency,
        reminder_time: reminderTime || null,
        target_days: targetDays,
      })
      toast.success('Hábito atualizado')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao atualizar hábito')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Hábito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-habit-title">Nome do hábito</Label>
            <Input
              id="edit-habit-title"
              placeholder="Ex: Beber 2L de água"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-habit-description">Descrição (opcional)</Label>
            <Input
              id="edit-habit-description"
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
            <Label htmlFor="edit-habit-reminder">Horário de lembrete (opcional)</Label>
            <Input
              id="edit-habit-reminder"
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-habit-target">Meta de dias</Label>
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
          </div>

          <Button type="submit" className="w-full" disabled={updateHabit.isPending}>
            {updateHabit.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
