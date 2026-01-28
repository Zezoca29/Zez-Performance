'use client'

import { useCategories } from '@/hooks/use-finances'
import { cn } from '@/lib/utils'

interface CategorySelectProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return <div className="h-10 bg-muted rounded animate-pulse" />
  }

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={cn(
        'w-full h-10 px-3 rounded-md border border-input bg-background text-sm',
        'focus:outline-none focus:ring-2 focus:ring-ring'
      )}
    >
      <option value="">Sem categoria</option>
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
