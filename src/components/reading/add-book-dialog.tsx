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
import { useAddBook } from '@/hooks/use-reading'
import { toast } from 'sonner'

export function AddBookDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const addBook = useAddBook()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !totalPages) return

    try {
      await addBook.mutateAsync({
        title,
        author: author || undefined,
        total_pages: parseInt(totalPages),
      })
      toast.success('Livro adicionado')
      setTitle('')
      setAuthor('')
      setTotalPages('')
      setOpen(false)
    } catch {
      toast.error('Erro ao adicionar livro')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo livro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar livro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titulo</label>
            <Input
              placeholder="Nome do livro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Autor (opcional)</label>
            <Input
              placeholder="Nome do autor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Total de paginas</label>
            <Input
              type="number"
              placeholder="300"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={addBook.isPending}>
            {addBook.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
