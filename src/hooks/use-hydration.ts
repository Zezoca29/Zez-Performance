'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import type { HydrationLog } from '@/types/database'

export function useHydrationToday() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['hydration', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { total: 0, goal: 2500, percentage: 0, logs: [] }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('hydration_goal_ml')
        .eq('user_id', user.id)
        .single()

      const goal = profile?.hydration_goal_ml ?? 2500

      const { data: logs, error } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (error) throw error

      const total = logs?.reduce((sum, log) => sum + log.amount_ml, 0) ?? 0
      const percentage = Math.min(100, Math.round((total / goal) * 100))

      return { total, goal, percentage, logs: logs as HydrationLog[] }
    },
  })
}

export function useHydrationWeek() {
  const supabase = createClient()
  const today = new Date()

  return useQuery({
    queryKey: ['hydration-week'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const weekData = []
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd')
        const { data } = await supabase
          .from('hydration_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .eq('date', date)

        const total = data?.reduce((sum, log) => sum + log.amount_ml, 0) ?? 0
        weekData.push({ date, total })
      }

      return weekData
    },
  })
}

export function useAddHydration() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMutation({
    mutationFn: async (amount_ml: number) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('hydration_logs')
        .insert({ user_id: user.id, amount_ml, date: today })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useDeleteHydration() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hydration_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}
