'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Skill, Project, Delivery, SkillLevel, ProjectStatus } from '@/types/database'

export function useSkills() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Skill[]
    },
  })
}

export function useSkill(skillId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['skill', skillId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: skill, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      const { data: projects } = await supabase
        .from('projects')
        .select('*, deliveries(*)')
        .eq('skill_id', skillId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      return {
        skill: skill as Skill,
        projects: projects as (Project & { deliveries: Delivery[] })[],
      }
    },
    enabled: !!skillId,
  })
}

export function useAddSkill() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, level }: { name: string; level?: SkillLevel }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('skills')
        .insert({ user_id: user.id, name, level: level ?? 'beginner' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
}

export function useAddProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ skill_id, name }: { skill_id: string; name: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .insert({ user_id: user.id, skill_id, name })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill'] })
    },
  })
}

export function useUpdateProjectStatus() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill'] })
    },
  })
}

export function useAddDelivery() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ project_id, title }: { project_id: string; title: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('deliveries')
        .insert({ user_id: user.id, project_id, title })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill'] })
    },
  })
}

export function useToggleDelivery() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase
        .from('deliveries')
        .update({ is_completed })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill'] })
    },
  })
}
