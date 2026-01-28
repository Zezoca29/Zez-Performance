'use client'

import { Button } from '@/components/ui/button'
import { useAddHydration } from '@/hooks/use-hydration'
import { toast } from 'sonner'

const amounts = [
  { label: '+250ml', value: 250 },
  { label: '+500ml', value: 500 },
  { label: '+1L', value: 1000 },
]

export function QuickAddButtons() {
  const addHydration = useAddHydration()

  const handleAdd = async (amount: number) => {
    try {
      await addHydration.mutateAsync(amount)
      toast.success(`${amount}ml adicionado!`)
    } catch {
      toast.error('Erro ao adicionar agua')
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {amounts.map(({ label, value }) => (
        <Button
          key={value}
          variant="outline"
          size="lg"
          onClick={() => handleAdd(value)}
          disabled={addHydration.isPending}
          className="flex-1 max-w-[120px]"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
