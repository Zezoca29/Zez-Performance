'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'

// Key for storing last reset date in localStorage
const LAST_RESET_KEY = 'zez_last_daily_reset'

export function useDailyReset() {
  const queryClient = useQueryClient()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const runDailyReset = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = format(new Date(), 'yyyy-MM-dd')
      const lastReset = localStorage.getItem(LAST_RESET_KEY)

      // Already ran today
      if (lastReset === today) return

      // Generate routine tasks for today
      await generateDailyTasks(supabase, user.id, today)

      // Update habit streaks (check for broken streaks)
      await checkAndUpdateStreaks(supabase, user.id)

      // Mark as done for today
      localStorage.setItem(LAST_RESET_KEY, today)

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    }

    runDailyReset()
  }, [queryClient])
}

async function generateDailyTasks(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  today: string
) {
  // Check if tasks already exist for today from templates
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('template_id')
    .eq('user_id', userId)
    .eq('date', today)
    .eq('is_routine', true)

  const existingTemplateIds = new Set(existingTasks?.map(t => t.template_id) ?? [])

  // Get active templates
  const { data: templates } = await supabase
    .from('routine_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (!templates || templates.length === 0) return

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = new Date().getDay()

  // Filter templates for today
  const todayTemplates = templates.filter(t =>
    t.days_of_week.includes(dayOfWeek) && !existingTemplateIds.has(t.id)
  )

  if (todayTemplates.length === 0) return

  // Create tasks for each template
  const tasksToInsert = todayTemplates.map(template => ({
    user_id: userId,
    template_id: template.id,
    title: template.title,
    date: today,
    is_completed: false,
    is_routine: true,
  }))

  await supabase.from('tasks').insert(tasksToInsert)
}

async function checkAndUpdateStreaks(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  // Get all active habits
  const { data: habits } = await supabase
    .from('habits')
    .select('id, current_streak')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!habits || habits.length === 0) return

  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  // For each habit, check if yesterday was logged
  for (const habit of habits) {
    if (habit.current_streak === 0) continue // Already at 0

    const { data: yesterdayLog } = await supabase
      .from('habit_logs')
      .select('completed')
      .eq('habit_id', habit.id)
      .eq('date', yesterday)
      .single()

    // If no log or not completed yesterday, reset streak
    if (!yesterdayLog || !yesterdayLog.completed) {
      await supabase
        .from('habits')
        .update({ current_streak: 0, level: 1 })
        .eq('id', habit.id)
    }
  }
}
