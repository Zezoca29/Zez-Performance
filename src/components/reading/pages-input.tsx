'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogReading } from '@/hooks/use-reading'
import { toast } from 'sonner'

interface PagesInputProps {
  bookId: string
  bookTitle: string
}

export function PagesInput({ bookId, bookTitle }: PagesInputProps) {
  const [pages, setPages] = useState('')
  const logReading = useLogReading()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pages) return

    try {
      await logReading.mutateAsync({
        book_id: bookId,
        pages_read: parseInt(pages),
      })
      toast.success(`${pages} paginas registradas em "${bookTitle}"`)
      setPages('')
    } catch {
      toast.error('Erro ao registrar leitura')
    }
  }

  const quickAmounts = [5, 10, 20]

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="number"
          placeholder="Paginas lidas"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={logReading.isPending || !pages}>
          Registrar
        </Button>
      </form>
      <div className="flex gap-2">
        {quickAmounts.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setPages(amount.toString())}
          >
            +{amount}
          </Button>
        ))}
      </div>
    </div>
  )
}
