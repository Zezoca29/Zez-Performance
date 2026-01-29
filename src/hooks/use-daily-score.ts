'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export function useDailyScore() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['daily-score', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { score: 0, streak: 0 }

      // Get hydration data (15 points)
      const { data: hydrationData } = await supabase
        .from('hydration_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', today)

      const hydrationTotal = hydrationData?.reduce((sum, log) => sum + log.amount_ml, 0) ?? 0
      const hydrationScore = Math.min(15, Math.round((hydrationTotal / 2500) * 15))

      // Get tasks data (25 points)
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('date', today)

      const totalTasks = tasksData?.length ?? 0
      const completedTasks = tasksData?.filter(t => t.is_completed).length ?? 0
      const tasksScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 25) : 0

      // Get habits data (15 points) - NEW
      const { data: habitsData } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)

      const { data: habitLogsData } = await supabase
        .from('habit_logs')
        .select('habit_id, completed')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('completed', true)

      const totalHabits = habitsData?.length ?? 0
      const completedHabits = habitLogsData?.length ?? 0
      const habitsScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 15) : 0

      // Get gym data (15 points)
      const { data: gymData } = await supabase
        .from('gym_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1)

      const gymScore = gymData && gymData.length > 0 ? 15 : 0

      // Get diet data (15 points)
      const { data: dietStatus } = await supabase
        .from('diet_daily_status')
        .select('status')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      let dietScore = 0
      if (dietStatus?.status === 'clean') dietScore = 15
      else if (dietStatus?.status === 'partial') dietScore = 8

      // Get reading data (15 points)
      const { data: readingData } = await supabase
        .from('reading_logs')
        .select('pages_read')
        .eq('user_id', user.id)
        .eq('date', today)

      const pagesRead = readingData?.reduce((sum, log) => sum + log.pages_read, 0) ?? 0
      const readingScore = pagesRead >= 10 ? 15 : Math.round((pagesRead / 10) * 15)

      // Total: 15 (hydration) + 25 (tasks) + 15 (habits) + 15 (gym) + 15 (diet) + 15 (reading) = 100
      const totalScore = hydrationScore + tasksScore + habitsScore + gymScore + dietScore + readingScore

      // Calculate streak (consecutive days with score >= 70%)
      let streak = 0
      let checkDate = new Date()
      checkDate.setDate(checkDate.getDate() - 1)

      // Simple streak calculation - can be enhanced later
      // For now just return the calculated score

      return { score: totalScore, streak }
    },
  })
}
