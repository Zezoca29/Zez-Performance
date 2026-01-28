'use client'

import { cn } from '@/lib/utils'
import type { WorkoutType } from '@/types/database'

const workoutTypes: { value: WorkoutType; label: string; emoji: string }[] = [
  { value: 'strength', label: 'Musculacao', emoji: '💪' },
  { value: 'cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'functional', label: 'Funcional', emoji: '🎯' },
  { value: 'sports', label: 'Esportes', emoji: '⚽' },
  { value: 'flexibility', label: 'Flexibilidade', emoji: '🧘' },
  { value: 'other', label: 'Outro', emoji: '🏋️' },
]

interface WorkoutTypeSelectProps {
  value: WorkoutType | null
  onChange: (value: WorkoutType) => void
}

export function WorkoutTypeSelect({ value, onChange }: WorkoutTypeSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {workoutTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          className={cn(
            'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors',
            value === type.value
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          )}
        >
          <span className="text-xl">{type.emoji}</span>
          <span className="text-sm font-medium">{type.label}</span>
        </button>
      ))}
    </div>
  )
}
