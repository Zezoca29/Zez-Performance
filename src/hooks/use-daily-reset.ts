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
      const isNewDay = lastReset !== today

      // Always sync tasks (fix missing scheduled_time), but only generate new tasks/check streaks once per day
      await generateDailyTasks(supabase, user.id, today)

      if (isNewDay) {
        // Update habit streaks (check for broken streaks)
        await checkAndUpdateStreaks(supabase, user.id)

        // Mark as done for today
        localStorage.setItem(LAST_RESET_KEY, today)
      }

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
    .select('id, template_id, scheduled_time')
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

  if (!templates || templates.length === 0) return

  // Sync scheduled_time for existing tasks that are missing it
  if (existingTasks && existingTasks.length > 0) {
    const templateMap = new Map(templates.map(t => [t.id, t]))
    for (const task of existingTasks) {
      if (!task.scheduled_time && task.template_id) {
        const template = templateMap.get(task.template_id)
        if (template?.start_time) {
          await supabase
            .from('tasks')
            .update({ scheduled_time: template.start_time })
            .eq('id', task.id)
        }
      }
    }
  }

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = new Date().getDay()

  // Filter templates for today that don't have tasks yet
  const todayTemplates = templates.filter(t =>
    t.days_of_week.includes(dayOfWeek) && !existingTemplateIds.has(t.id)
  )

  if (todayTemplates.length === 0) return

  // Create tasks for each template (preserving order and time)
  const tasksToInsert = todayTemplates.map(template => ({
    user_id: userId,
    template_id: template.id,
    title: template.title,
    date: today,
    is_completed: false,
    is_routine: true,
    order_index: template.order_index,
    scheduled_time: template.start_time ?? null,
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
