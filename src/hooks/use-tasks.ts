'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Task } from '@/types/database'

export function useTasksToday() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['tasks', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { total: 0, completed: 0, percentage: 0, tasks: [] }

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, routine_templates(start_time)')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Resolve scheduled_time: use task's own value, or fallback to template's start_time
      const resolved = (tasks ?? []).map(task => {
        const templateTime = (task as any).routine_templates?.start_time ?? null
        const scheduled_time = task.scheduled_time || templateTime
        // Remove the joined relation from the final object
        const { routine_templates: _, ...rest } = task as any
        return { ...rest, scheduled_time } as Task
      })

      // Sort: tasks with scheduled_time first (by time asc), then tasks without
      const sorted = resolved.sort((a, b) => {
        const timeA = a.scheduled_time
        const timeB = b.scheduled_time
        if (timeA && timeB) return timeA.localeCompare(timeB)
        if (timeA && !timeB) return -1
        if (!timeA && timeB) return 1
        if (a.order_index !== b.order_index) return a.order_index - b.order_index
        return a.created_at.localeCompare(b.created_at)
      })

      const total = sorted.length
      const completed = sorted.filter(t => t.is_completed).length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

      return { total, completed, percentage, tasks: sorted }
    },
  })
}

export function useAddTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMutation({
    mutationFn: async (title: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: user.id, title, date: today })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useToggleTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_completed })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useDeleteTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}
