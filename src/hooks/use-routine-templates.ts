'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { RoutineTemplate, TimeType } from '@/types/database'

/** Create today's task for a template if it applies to today and doesn't already exist */
async function generateTodayTaskForTemplate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  template: { id: string; title: string; days_of_week: number[]; order_index: number; start_time: string | null }
) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const dayOfWeek = new Date().getDay()

  // Check if today is in the template's days
  if (!template.days_of_week.includes(dayOfWeek)) return

  // Check if task already exists for this template today
  const { data: existing } = await supabase
    .from('tasks')
    .select('id')
    .eq('template_id', template.id)
    .eq('date', today)
    .limit(1)

  if (existing && existing.length > 0) return

  await supabase.from('tasks').insert({
    user_id: userId,
    template_id: template.id,
    title: template.title,
    date: today,
    is_completed: false,
    is_routine: true,
    order_index: template.order_index,
    scheduled_time: template.start_time ?? null,
  })
}

export function useRoutineTemplates() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['routine-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('routine_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Sort by start_time (tasks with time first, ordered by time; then tasks without time)
      const sorted = [...(data ?? [])].sort((a, b) => {
        const timeA = a.start_time
        const timeB = b.start_time
        if (timeA && timeB) return timeA.localeCompare(timeB)
        if (timeA && !timeB) return -1
        if (!timeA && timeB) return 1
        return a.order_index - b.order_index
      })

      return sorted as RoutineTemplate[]
    },
  })
}

interface CreateTemplateInput {
  title: string
  days_of_week: number[]
  time_type: TimeType
  start_time?: string | null
  end_time?: string | null
  category?: string | null
}

export function useCreateRoutineTemplate() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get max order_index
      const { data: existing } = await supabase
        .from('routine_templates')
        .select('order_index')
        .eq('user_id', user.id)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0

      const { data, error } = await supabase
        .from('routine_templates')
        .insert({
          user_id: user.id,
          title: input.title,
          days_of_week: input.days_of_week,
          time_type: input.time_type,
          start_time: input.start_time ?? null,
          end_time: input.end_time ?? null,
          category: input.category ?? null,
          order_index: nextIndex,
        })
        .select()
        .single()

      if (error) throw error

      // Immediately generate today's task if this template applies to today
      await generateTodayTaskForTemplate(supabase, user.id, data)

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-templates'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

interface UpdateTemplateInput {
  id: string
  title?: string
  days_of_week?: number[]
  is_active?: boolean
  time_type?: TimeType
  start_time?: string | null
  end_time?: string | null
  category?: string | null
  order_index?: number
}

export function useUpdateRoutineTemplate() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTemplateInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('routine_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // If template is active, ensure today's task exists
      if (data.is_active) {
        await generateTodayTaskForTemplate(supabase, user.id, data)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-templates'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}

export function useDeleteRoutineTemplate() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('routine_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-templates'] })
    },
  })
}

export function useToggleRoutineTemplate() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('routine_templates')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // If activating, generate today's task
      if (is_active) {
        await generateTodayTaskForTemplate(supabase, user.id, data)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-templates'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['daily-score'] })
    },
  })
}
