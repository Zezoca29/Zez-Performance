'use client'

import Link from 'next/link'
import { Sparkles, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Skill, SkillLevel } from '@/types/database'

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

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link href={`/skills/${skill.id}`}>
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium">{skill.name}</h4>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  levelColors[skill.level]
                )}>
                  {levelLabels[skill.level]}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
