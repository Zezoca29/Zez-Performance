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
import { useUpdateRoutineTemplate } from '@/hooks/use-routine-templates'
import { toast } from 'sonner'
import type { RoutineTemplate, TimeType } from '@/types/database'

const DAYS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

interface EditRoutineDialogProps {
  template: RoutineTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRoutineDialog({ template, open, onOpenChange }: EditRoutineDialogProps) {
  const [title, setTitle] = useState(template.title)
  const [days, setDays] = useState<number[]>(template.days_of_week)
  const [timeType, setTimeType] = useState<TimeType>(template.time_type)
  const [startTime, setStartTime] = useState(template.start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(template.end_time?.slice(0, 5) ?? '')
  const [category, setCategory] = useState(template.category ?? '')

  const updateTemplate = useUpdateRoutineTemplate()

  useEffect(() => {
    setTitle(template.title)
    setDays(template.days_of_week)
    setTimeType(template.time_type)
    setStartTime(template.start_time?.slice(0, 5) ?? '')
    setEndTime(template.end_time?.slice(0, 5) ?? '')
    setCategory(template.category ?? '')
  }, [template])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (days.length === 0) {
      toast.error('Selecione pelo menos um dia')
      return
    }

    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        title: title.trim(),
        days_of_week: days,
        time_type: timeType,
        start_time: startTime || null,
        end_time: timeType === 'flexible' ? endTime || null : null,
        category: category.trim() || null,
      })
      toast.success('Template atualizado')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao atualizar template')
    }
  }

  const toggleDay = (day: number) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Tarefa</Label>
            <Input
              id="edit-title"
              placeholder="Ex: Meditar 10 minutos"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Dias da semana</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    days.includes(day.value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-accent'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de horário</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTimeType('fixed')}
                className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                  timeType === 'fixed'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                }`}
              >
                Horário fixo
              </button>
              <button
                type="button"
                onClick={() => setTimeType('flexible')}
                className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                  timeType === 'flexible'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                }`}
              >
                Período flexível
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-startTime">
              {timeType === 'fixed' ? 'Horário' : 'Início do período'}
            </Label>
            <Input
              id="edit-startTime"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>

          {timeType === 'flexible' && (
            <div className="space-y-2">
              <Label htmlFor="edit-endTime">Fim do período</Label>
              <Input
                id="edit-endTime"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria (opcional)</Label>
            <Input
              id="edit-category"
              placeholder="Ex: Saúde, Trabalho, Estudo"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={updateTemplate.isPending}>
            {updateTemplate.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
