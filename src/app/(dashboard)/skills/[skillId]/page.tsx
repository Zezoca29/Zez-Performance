'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectList } from '@/components/skills/project-list'
import { useSkill } from '@/hooks/use-skills'
import { cn } from '@/lib/utils'
import type { SkillLevel } from '@/types/database'

const levelLabels: Record<SkillLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediario',
  advanced: 'Avancado',
  expert: 'Expert',
}

const levelColors: Record<SkillLevel, string> = {
  beginner: 'bg-blue-500/20 text-blue-500',
  intermediate: 'bg-yellow-500/20 text-yellow-500',
  advanced: 'bg-orange-500/20 text-orange-500',
  expert: 'bg-primary/20 text-primary',
}

export default function SkillDetailPage({
  params,
}: {
  params: Promise<{ skillId: string }>
}) {
  const { skillId } = use(params)
  const { data, isLoading } = useSkill(skillId)

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-muted rounded-lg" />
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  }

  if (!data?.skill) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Skill nao encontrada</p>
        <Button asChild className="mt-4">
          <Link href="/skills">Voltar</Link>
        </Button>
      </div>
    )
  }

  const { skill, projects } = data

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/skills">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>{skill.name}</CardTitle>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded mt-1 inline-block',
                levelColors[skill.level]
              )}>
                {levelLabels[skill.level]}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProjectList skillId={skillId} projects={projects} />
        </CardContent>
      </Card>
    </div>
  )
}
