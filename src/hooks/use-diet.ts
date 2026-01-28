'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { DietLog, DietDailyStatus, DayStatus } from '@/types/database'

export function useDietToday() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['diet', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { status: null, mealsLogged: 0, logs: [], dailyStatus: null }

      const { data: logs } = await supabase
        .from('diet_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })

      const { data: dailyStatus } = await supabase
        .from('diet_daily_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      return {
        status: dailyStatus?.status ?? null,
        mealsLogged: logs?.length ?? 0,
        logs: logs as DietLog[],
        dailyStatus: dailyStatus as DietDailyStatus | null,
      }
    },
  })
}

export function useAddMealLog() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMutation({
    mutationFn: async ({ description, is_on_diet }: { description: string; is_on_diet: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('diet_logs')
        .insert({ user_id: user.id, date: today, description, is_on_diet })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useSetDayStatus() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMutation({
    mutationFn: async (status: DayStatus) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('diet_daily_status')
        .upsert({ user_id: user.id, date: today, status }, { onConflict: 'user_id,date' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useDeleteMealLog() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('diet_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet'] })
    },
  })
}
