'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import type { GymSession, WorkoutType } from '@/types/database'

const workoutTypeLabels: Record<WorkoutType, string> = {
  strength: 'Musculacao',
  cardio: 'Cardio',
  functional: 'Funcional',
  sports: 'Esportes',
  flexibility: 'Flexibilidade',
  other: 'Outro',
}

export function useGymToday() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['gym', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { checkedIn: false, workoutType: null, session: null }

      const { data: session, error } = await supabase
        .from('gym_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return {
        checkedIn: !!session,
        workoutType: session ? workoutTypeLabels[session.workout_type as WorkoutType] : null,
        session: session as GymSession | null,
      }
    },
  })
}

export function useGymStats() {
  const supabase = createClient()
  const today = new Date()

  return useQuery({
    queryKey: ['gym-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { weekCount: 0, monthCount: 0, streak: 0 }

      const weekStart = format(subDays(today, 7), 'yyyy-MM-dd')
      const monthStart = format(subDays(today, 30), 'yyyy-MM-dd')

      const { data: weekData } = await supabase
        .from('gym_sessions')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', weekStart)

      const { data: monthData } = await supabase
        .from('gym_sessions')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', monthStart)

      return {
        weekCount: weekData?.length ?? 0,
        monthCount: monthData?.length ?? 0,
        streak: 0, // Can calculate proper streak later
      }
    },
  })
}

export function useCheckInGym() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMutation({
    mutationFn: async ({
      workout_type,
      duration_minutes,
      notes,
    }: {
      workout_type: WorkoutType
      duration_minutes?: number
      notes?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('gym_sessions')
        .insert({
          user_id: user.id,
          date: today,
          workout_type,
          duration_minutes,
          notes,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useDeleteGymSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gym_sessions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}
