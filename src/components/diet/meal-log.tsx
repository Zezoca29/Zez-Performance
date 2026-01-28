'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useAddMealLog, useDeleteMealLog } from '@/hooks/use-diet'
import { toast } from 'sonner'
import type { DietLog } from '@/types/database'

interface MealLogProps {
  logs: DietLog[]
}

export function MealLog({ logs }: MealLogProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [isOnDiet, setIsOnDiet] = useState(true)
  const addMeal = useAddMealLog()
  const deleteMeal = useDeleteMealLog()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    try {
      await addMeal.mutateAsync({ description, is_on_diet: isOnDiet })
      toast.success('Refeicao registrada')
      setDescription('')
      setIsOnDiet(true)
      setOpen(false)
    } catch {
      toast.error('Erro ao registrar refeicao')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMeal.mutateAsync(id)
      toast.success('Registro removido')
    } catch {
      toast.error('Erro ao remover registro')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Refeicoes de hoje</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar refeicao</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Ex: Almoco - Frango com salada"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isOnDiet"
                  checked={isOnDiet}
                  onCheckedChange={(checked) => setIsOnDiet(checked as boolean)}
                />
                <label htmlFor="isOnDiet" className="text-sm">
                  Dentro da dieta
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={addMeal.isPending}>
                {addMeal.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma refeicao registrada
        </p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div>
                <span className="text-sm">{log.description}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    log.is_on_diet ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {log.is_on_diet ? 'Na dieta' : 'Fora'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), 'HH:mm')}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(log.id)}
                disabled={deleteMeal.isPending}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
