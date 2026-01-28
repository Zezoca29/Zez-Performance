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
import { CategorySelect } from './category-select'
import { useAddExpense } from '@/hooks/use-finances'
import { toast } from 'sonner'

export function ExpenseForm() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const addExpense = useAddExpense()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description.trim()) return

    try {
      await addExpense.mutateAsync({
        amount: parseFloat(amount),
        description,
        category_id: categoryId || undefined,
      })
      toast.success('Gasto registrado')
      setAmount('')
      setDescription('')
      setCategoryId(null)
      setOpen(false)
    } catch {
      toast.error('Erro ao registrar gasto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo gasto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor (R$)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descricao</label>
            <Input
              placeholder="Ex: Almoco no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          </div>
          <Button type="submit" className="w-full" disabled={addExpense.isPending}>
            {addExpense.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
