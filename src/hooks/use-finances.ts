'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import type { Expense, FinanceCategory } from '@/types/database'

export function useExpensesToday() {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['expenses', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { todayTotal: 0, transactionsCount: 0, expenses: [] }

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*, finance_categories(name, color)')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (error) throw error

      const todayTotal = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0

      return {
        todayTotal,
        transactionsCount: expenses?.length ?? 0,
        expenses: expenses as (Expense & { finance_categories: FinanceCategory | null })[],
      }
    },
  })
}

export function useMonthlyExpenses() {
  const supabase = createClient()
  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['expenses-monthly', monthStart],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { total: 0, byCategory: [], expenses: [] }

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*, finance_categories(name, color)')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false })

      if (error) throw error

      const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0

      // Group by category
      const categoryTotals = new Map<string, { name: string; color: string | null; total: number }>()
      expenses?.forEach(e => {
        const catName = e.finance_categories?.name ?? 'Sem categoria'
        const catColor = e.finance_categories?.color ?? null
        const existing = categoryTotals.get(catName)
        if (existing) {
          existing.total += Number(e.amount)
        } else {
          categoryTotals.set(catName, { name: catName, color: catColor, total: Number(e.amount) })
        }
      })

      return {
        total,
        byCategory: Array.from(categoryTotals.values()),
        expenses: expenses as (Expense & { finance_categories: FinanceCategory | null })[],
      }
    },
  })
}

export function useCategories() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['finance-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      return data as FinanceCategory[]
    },
  })
}

export function useAddExpense() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      amount,
      description,
      category_id,
      date,
    }: {
      amount: number
      description: string
      category_id?: string
      date?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount,
          description,
          category_id,
          date: date ?? format(new Date(), 'yyyy-MM-dd'),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useAddCategory() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      name,
      icon,
      color,
      budget_limit,
    }: {
      name: string
      icon?: string
      color?: string
      budget_limit?: number
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('finance_categories')
        .insert({ user_id: user.id, name, icon, color, budget_limit })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-categories'] })
    },
  })
}

export function useDeleteExpense() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
