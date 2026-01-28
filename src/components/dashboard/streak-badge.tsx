'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  count: number
  label?: string
  className?: string
}

export function StreakBadge({ count, label = 'dias', className }: StreakBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-sm', className)}>
      <Flame className={cn(
        'h-4 w-4',
        count > 0 ? 'text-orange-500' : 'text-muted-foreground'
      )} />
      <span className={cn(
        'font-medium',
        count > 0 ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {count} {label}
      </span>
    </div>
  )
}
