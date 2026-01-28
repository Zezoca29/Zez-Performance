'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SkillCard } from '@/components/skills/skill-card'
import { useSkills, useAddSkill } from '@/hooks/use-skills'
import { toast } from 'sonner'
import type { SkillLevel } from '@/types/database'

const levels: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediario' },
  { value: 'advanced', label: 'Avancado' },
  { value: 'expert', label: 'Expert' },
]

export default function SkillsPage() {
  const { data: skills, isLoading } = useSkills()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [level, setLevel] = useState<SkillLevel>('beginner')
  const addSkill = useAddSkill()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await addSkill.mutateAsync({ name, level })
      toast.success('Skill adicionada')
      setName('')
      setLevel('beginner')
      setOpen(false)
    } catch {
      toast.error('Erro ao adicionar skill')
    }
  }

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-muted rounded-lg" />
      <div className="h-20 bg-muted rounded-lg" />
      <div className="h-20 bg-muted rounded-lg" />
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar skill</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    placeholder="Ex: TypeScript"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nivel</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {levels.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={addSkill.isPending}>
                  {addSkill.isPending ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {skills && skills.length > 0 ? (
            <div className="space-y-3">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma skill cadastrada ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
