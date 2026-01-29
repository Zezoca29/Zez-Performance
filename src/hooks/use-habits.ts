'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Habit } from '@/types/database'

export function useHabits() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Habit[]
    },
  })
}

export function useAllHabits() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['habits', 'all'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Habit[]
    },
  })
}

interface CreateHabitInput {
  title: string
  description?: string | null
  frequency_per_week?: number
  reminder_time?: string | null
  target_days?: number
}

export function useCreateHabit() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateHabitInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description ?? null,
          frequency_per_week: input.frequency_per_week ?? 7,
          reminder_time: input.reminder_time ?? null,
          target_days: input.target_days ?? 66,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

interface UpdateHabitInput {
  id: string
  title?: string
  description?: string | null
  frequency_per_week?: number
  reminder_time?: string | null
  target_days?: number
  current_streak?: number
  longest_streak?: number
  level?: number
  is_active?: boolean
}

export function useUpdateHabit() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateHabitInput) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useDeleteHabit() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

// Calculate level based on streak
export function calculateHabitLevel(streak: number): number {
  if (streak >= 66) return 4  // Habit formed
  if (streak >= 21) return 3  // Consolidating
  if (streak >= 7) return 2   // Forming
  return 1                     // Starting
}

// Get level info (emoji, name, description)
export function getHabitLevelInfo(level: number) {
  switch (level) {
    case 4:
      return { emoji: '⭐', name: 'Mestre', description: 'Hábito formado!' }
    case 3:
      return { emoji: '💪', name: 'Consolidando', description: '21+ dias' }
    case 2:
      return { emoji: '🌱', name: 'Formando', description: '7+ dias' }
    default:
      return { emoji: '🔥', name: 'Iniciando', description: 'Continue assim!' }
  }
}
