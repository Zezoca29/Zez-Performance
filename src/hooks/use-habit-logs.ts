'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import type { HabitLog } from '@/types/database'
import { calculateHabitLevel } from './use-habits'

export function useHabitLogsToday() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['habit-logs', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

      if (error) throw error
      return data as HabitLog[]
    },
  })
}

export function useHabitLogsWeek(habitId: string) {
  const supabase = createClient()
  const today = new Date()
  const weekAgo = format(subDays(today, 6), 'yyyy-MM-dd')
  const todayStr = format(today, 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['habit-logs', 'week', habitId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .gte('date', weekAgo)
        .lte('date', todayStr)
        .order('date', { ascending: true })

      if (error) throw error
      return data as HabitLog[]
    },
  })
}

export function useToggleHabitLog() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const today = format(new Date(), 'yyyy-MM-dd')

      if (completed) {
        // Create or update log as completed
        const { data, error } = await supabase
          .from('habit_logs')
          .upsert(
            {
              habit_id: habitId,
              user_id: user.id,
              date: today,
              completed: true,
            },
            { onConflict: 'habit_id,date' }
          )
          .select()
          .single()

        if (error) throw error

        // Update streak
        await updateHabitStreak(supabase, habitId, user.id)

        return data
      } else {
        // Mark as not completed
        const { error } = await supabase
          .from('habit_logs')
          .update({ completed: false })
          .eq('habit_id', habitId)
          .eq('date', today)

        if (error && error.code !== 'PGRST116') throw error // Ignore not found

        // Update streak
        await updateHabitStreak(supabase, habitId, user.id)

        return null
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] })
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

async function updateHabitStreak(
  supabase: ReturnType<typeof createClient>,
  habitId: string,
  userId: string
) {
  // Get all completed logs for this habit, ordered by date desc
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('date, completed')
    .eq('habit_id', habitId)
    .eq('completed', true)
    .order('date', { ascending: false })

  if (!logs || logs.length === 0) {
    // No completed logs, reset streak
    await supabase
      .from('habits')
      .update({ current_streak: 0, level: 1 })
      .eq('id', habitId)
    return
  }

  // Calculate current streak
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const logDates = new Set(logs.map(l => l.date))

  // Check if today or yesterday has a log (to continue streak)
  const todayStr = format(today, 'yyyy-MM-dd')
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd')

  if (!logDates.has(todayStr) && !logDates.has(yesterdayStr)) {
    // Streak broken
    await supabase
      .from('habits')
      .update({ current_streak: 0, level: 1 })
      .eq('id', habitId)
    return
  }

  // Count consecutive days
  let checkDate = logDates.has(todayStr) ? today : subDays(today, 1)

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd')
    if (logDates.has(dateStr)) {
      streak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  // Get current habit data for longest_streak comparison
  const { data: habit } = await supabase
    .from('habits')
    .select('longest_streak')
    .eq('id', habitId)
    .single()

  const longestStreak = Math.max(habit?.longest_streak ?? 0, streak)
  const level = calculateHabitLevel(streak)

  await supabase
    .from('habits')
    .update({
      current_streak: streak,
      longest_streak: longestStreak,
      level,
    })
    .eq('id', habitId)
}

// Check if habit is completed today
export function useIsHabitCompletedToday(habitId: string, logs: HabitLog[]) {
  const today = format(new Date(), 'yyyy-MM-dd')
  return logs.some(log => log.habit_id === habitId && log.date === today && log.completed)
}
