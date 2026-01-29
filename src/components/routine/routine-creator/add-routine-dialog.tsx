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
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateRoutineTemplate } from '@/hooks/use-routine-templates'
import { toast } from 'sonner'
import type { TimeType } from '@/types/database'

const DAYS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

export function AddRoutineDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [timeType, setTimeType] = useState<TimeType>('fixed')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [category, setCategory] = useState('')

  const createTemplate = useCreateRoutineTemplate()

  const resetForm = () => {
    setTitle('')
    setDays([1, 2, 3, 4, 5])
    setTimeType('fixed')
    setStartTime('')
    setEndTime('')
    setCategory('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (days.length === 0) {
      toast.error('Selecione pelo menos um dia')
      return
    }

    try {
      await createTemplate.mutateAsync({
        title: title.trim(),
        days_of_week: days,
        time_type: timeType,
        start_time: startTime || null,
        end_time: timeType === 'flexible' ? endTime || null : null,
        category: category.trim() || null,
      })
      toast.success('Template criado')
      resetForm()
      setOpen(false)
    } catch {
      toast.error('Erro ao criar template')
    }
  }

  const toggleDay = (day: number) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Template de Rotina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tarefa</Label>
            <Input
              id="title"
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
            <Label htmlFor="startTime">
              {timeType === 'fixed' ? 'Horário' : 'Início do período'}
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>

          {timeType === 'flexible' && (
            <div className="space-y-2">
              <Label htmlFor="endTime">Fim do período</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input
              id="category"
              placeholder="Ex: Saúde, Trabalho, Estudo"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createTemplate.isPending}>
            {createTemplate.isPending ? 'Criando...' : 'Criar template'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
