'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'

export function useStreaks() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['streaks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { overall: 0, hydration: 0, gym: 0, tasks: 0, reading: 0 }

      const today = new Date()
      let overallStreak = 0
      let hydrationStreak = 0
      let gymStreak = 0
      let tasksStreak = 0
      let readingStreak = 0

      // Calculate streaks by checking consecutive days
      for (let i = 1; i <= 365; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd')

        // Check hydration
        const { data: hydrationData } = await supabase
          .from('hydration_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .eq('date', date)

        const hydrationTotal = hydrationData?.reduce((sum, log) => sum + log.amount_ml, 0) ?? 0
        if (hydrationTotal >= 2000 && hydrationStreak === i - 1) {
          hydrationStreak = i
        }

        // Check gym
        const { data: gymData } = await supabase
          .from('gym_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', date)
          .limit(1)

        if (gymData && gymData.length > 0 && gymStreak === i - 1) {
          gymStreak = i
        }

        // Check tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('is_completed')
          .eq('user_id', user.id)
          .eq('date', date)

        const totalTasks = tasksData?.length ?? 0
        const completedTasks = tasksData?.filter(t => t.is_completed).length ?? 0
        if (totalTasks > 0 && completedTasks >= totalTasks * 0.8 && tasksStreak === i - 1) {
          tasksStreak = i
        }

        // Check reading
        const { data: readingData } = await supabase
          .from('reading_logs')
          .select('pages_read')
          .eq('user_id', user.id)
          .eq('date', date)

        const pagesRead = readingData?.reduce((sum, log) => sum + log.pages_read, 0) ?? 0
        if (pagesRead >= 5 && readingStreak === i - 1) {
          readingStreak = i
        }

        // Stop if no streaks are continuing
        if (
          hydrationStreak < i - 1 &&
          gymStreak < i - 1 &&
          tasksStreak < i - 1 &&
          readingStreak < i - 1
        ) {
          break
        }
      }

      overallStreak = Math.max(hydrationStreak, gymStreak, tasksStreak, readingStreak)

      return {
        overall: overallStreak,
        hydration: hydrationStreak,
        gym: gymStreak,
        tasks: tasksStreak,
        reading: readingStreak,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
