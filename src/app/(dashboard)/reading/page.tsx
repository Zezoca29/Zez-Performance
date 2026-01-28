'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookCard } from '@/components/reading/book-card'
import { AddBookDialog } from '@/components/reading/add-book-dialog'
import { PagesInput } from '@/components/reading/pages-input'
import { useBooks, useReadingToday } from '@/hooks/use-reading'

export default function ReadingPage() {
  const { data: books, isLoading: loadingBooks } = useBooks()
  const { data: todayData, isLoading: loadingToday } = useReadingToday()
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

  const activeBooks = books?.filter(b => b.status === 'reading') ?? []
  const completedBooks = books?.filter(b => b.status === 'completed') ?? []
  const selectedBook = books?.find(b => b.id === selectedBookId)

  if (loadingBooks || loadingToday) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-muted rounded-lg" />
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leitura de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`p-4 rounded-full ${(todayData?.pagesRead ?? 0) >= 10 ? 'bg-primary/20' : 'bg-muted'}`}>
              <BookOpen className={`h-10 w-10 ${(todayData?.pagesRead ?? 0) >= 10 ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{todayData?.pagesRead ?? 0}</p>
              <p className="text-sm text-muted-foreground">paginas lidas hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBook && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrar leitura</CardTitle>
          </CardHeader>
          <CardContent>
            <PagesInput bookId={selectedBook.id} bookTitle={selectedBook.title} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Lendo agora</CardTitle>
          <AddBookDialog />
        </CardHeader>
        <CardContent>
          {activeBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum livro em andamento
            </p>
          ) : (
            <div className="space-y-3">
              {activeBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  selected={selectedBookId === book.id}
                  onSelect={() => setSelectedBookId(book.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {completedBooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Concluidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
