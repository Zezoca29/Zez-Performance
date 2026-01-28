'use client'

import { useState } from 'react'
import { Save, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/providers/auth-provider'
import { useUserProfile } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const { signOut } = useAuth()
  const { data: profile, isLoading } = useUserProfile()
  const [fullName, setFullName] = useState('')
  const [hydrationGoal, setHydrationGoal] = useState('')
  const [initialized, setInitialized] = useState(false)
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Initialize form with profile data
  if (profile && !initialized) {
    setFullName(profile.full_name ?? '')
    setHydrationGoal(String(profile.hydration_goal_ml))
    setInitialized(true)
  }

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          hydration_goal_ml: parseInt(hydrationGoal) || 2500,
        })
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Configuracoes salvas')
    },
    onError: () => {
      toast.error('Erro ao salvar configuracoes')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate()
  }

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuracoes</CardTitle>
          <CardDescription>Gerencie seu perfil e preferencias</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta de hidratacao (ml)</label>
              <Input
                type="number"
                value={hydrationGoal}
                onChange={(e) => setHydrationGoal(e.target.value)}
                placeholder="2500"
              />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
