'use client'

import { useState } from 'react'
import { Dumbbell, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WorkoutTypeSelect } from './workout-type-select'
import { useCheckInGym } from '@/hooks/use-gym'
import { toast } from 'sonner'
import type { WorkoutType } from '@/types/database'

interface CheckInButtonProps {
  isCheckedIn: boolean
}

export function CheckInButton({ isCheckedIn }: CheckInButtonProps) {
  const [open, setOpen] = useState(false)
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null)
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const checkIn = useCheckInGym()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workoutType) {
      toast.error('Selecione o tipo de treino')
      return
    }

    try {
      await checkIn.mutateAsync({
        workout_type: workoutType,
        duration_minutes: duration ? parseInt(duration) : undefined,
        notes: notes || undefined,
      })
      toast.success('Check-in realizado!')
      setOpen(false)
      setWorkoutType(null)
      setDuration('')
      setNotes('')
    } catch {
      toast.error('Erro ao fazer check-in')
    }
  }

  if (isCheckedIn) {
    return (
      <Button size="lg" className="w-full" disabled>
        <Check className="h-5 w-5 mr-2" />
        Treino registrado
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Dumbbell className="h-5 w-5 mr-2" />
          Fazer check-in
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in Academia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de treino</label>
            <WorkoutTypeSelect value={workoutType} onChange={setWorkoutType} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duracao (minutos)</label>
            <Input
              type="number"
              placeholder="60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Input
              placeholder="Ex: Treino de pernas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={checkIn.isPending}>
            {checkIn.isPending ? 'Salvando...' : 'Confirmar check-in'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
