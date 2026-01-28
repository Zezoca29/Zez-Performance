'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Book, ReadingLog, BookStatus } from '@/types/database'

export function useReadingToday() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['reading', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { pagesRead: 0, currentBook: null, logs: [] }

      const { data: logs } = await supabase
        .from('reading_logs')
        .select('*, books(title)')
        .eq('user_id', user.id)
        .eq('date', today)

      const { data: currentBook } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'reading')
        .limit(1)
        .single()

      const pagesRead = logs?.reduce((sum, log) => sum + log.pages_read, 0) ?? 0

      return {
        pagesRead,
        currentBook: currentBook?.title ?? null,
        logs: logs as (ReadingLog & { books: { title: string } })[],
      }
    },
  })
}

export function useBooks() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Book[]
    },
  })
}

export function useAddBook() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      title,
      author,
      total_pages,
    }: {
      title: string
      author?: string
      total_pages: number
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('books')
        .insert({ user_id: user.id, title, author, total_pages })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useLogReading() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMutation({
    mutationFn: async ({ book_id, pages_read }: { book_id: string; pages_read: number }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Add reading log
      const { error: logError } = await supabase
        .from('reading_logs')
        .insert({ user_id: user.id, book_id, pages_read, date: today })

      if (logError) throw logError

      // Update book current page
      const { data: book } = await supabase
        .from('books')
        .select('current_page, total_pages')
        .eq('id', book_id)
        .single()

      if (book) {
        const newPage = Math.min(book.current_page + pages_read, book.total_pages)
        const newStatus: BookStatus = newPage >= book.total_pages ? 'completed' : 'reading'

        await supabase
          .from('books')
          .update({ current_page: newPage, status: newStatus })
          .eq('id', book_id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useUpdateBookStatus() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookStatus }) => {
      const { error } = await supabase
        .from('books')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
