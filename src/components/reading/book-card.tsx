'use client'

import { BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Book } from '@/types/database'

interface BookCardProps {
  book: Book
  onSelect?: () => void
  selected?: boolean
}

export function BookCard({ book, onSelect, selected }: BookCardProps) {
  const progress = Math.round((book.current_page / book.total_pages) * 100)

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors',
        selected ? 'border-primary' : 'hover:border-primary/50',
        book.status === 'completed' && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{book.title}</h4>
            {book.author && (
              <p className="text-xs text-muted-foreground truncate">{book.author}</p>
            )}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{book.current_page}/{book.total_pages} pags</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
