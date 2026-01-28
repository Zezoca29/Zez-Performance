'use client'

import { cn } from '@/lib/utils'
import { useSetDayStatus } from '@/hooks/use-diet'
import { toast } from 'sonner'
import type { DayStatus } from '@/types/database'

const statusOptions: { value: DayStatus; label: string; color: string }[] = [
  { value: 'clean', label: 'Limpo', color: 'bg-primary text-primary-foreground' },
  { value: 'partial', label: 'Parcial', color: 'bg-yellow-500 text-black' },
  { value: 'free', label: 'Livre', color: 'bg-muted text-muted-foreground' },
]

interface DayStatusToggleProps {
  currentStatus: DayStatus | null
}

export function DayStatusToggle({ currentStatus }: DayStatusToggleProps) {
  const setStatus = useSetDayStatus()

  const handleStatusChange = async (status: DayStatus) => {
    try {
      await setStatus.mutateAsync(status)
      toast.success(`Dia marcado como ${statusOptions.find(s => s.value === status)?.label}`)
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <div className="flex gap-2">
      {statusOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleStatusChange(option.value)}
          disabled={setStatus.isPending}
          className={cn(
            'flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm',
            currentStatus === option.value
              ? option.color
              : 'bg-card border border-border hover:border-primary/50'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
