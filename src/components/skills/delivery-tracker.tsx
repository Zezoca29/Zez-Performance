'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useAddDelivery, useToggleDelivery } from '@/hooks/use-skills'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Delivery } from '@/types/database'

interface DeliveryTrackerProps {
  projectId: string
  deliveries: Delivery[]
}

export function DeliveryTracker({ projectId, deliveries }: DeliveryTrackerProps) {
  const [title, setTitle] = useState('')
  const addDelivery = useAddDelivery()
  const toggleDelivery = useToggleDelivery()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await addDelivery.mutateAsync({ project_id: projectId, title })
      setTitle('')
    } catch {
      toast.error('Erro ao adicionar entrega')
    }
  }

  const handleToggle = async (id: string, is_completed: boolean) => {
    try {
      await toggleDelivery.mutateAsync({ id, is_completed })
    } catch {
      toast.error('Erro ao atualizar entrega')
    }
  }

  const completed = deliveries.filter(d => d.is_completed).length
  const total = deliveries.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Entregas: {completed}/{total}
        </span>
      </div>

      {deliveries.length > 0 && (
        <ul className="space-y-2">
          {deliveries.map((delivery) => (
            <li key={delivery.id} className="flex items-center gap-2">
              <Checkbox
                checked={delivery.is_completed}
                onCheckedChange={(checked) => handleToggle(delivery.id, checked as boolean)}
              />
              <span className={cn(
                'text-sm',
                delivery.is_completed && 'line-through text-muted-foreground'
              )}>
                {delivery.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Nova entrega"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-sm"
        />
        <Button type="submit" size="sm" disabled={addDelivery.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
