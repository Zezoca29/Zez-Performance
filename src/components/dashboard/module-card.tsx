'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface ModuleCardProps {
  title: string
  icon: LucideIcon
  value: string
  subtext?: string
  progress?: number
  href: string
  className?: string
}

export function ModuleCard({
  title,
  icon: Icon,
  value,
  subtext,
  progress,
  href,
  className,
}: ModuleCardProps) {
  return (
    <Link href={href}>
      <Card className={cn(
        'hover:border-primary/50 transition-colors cursor-pointer',
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
          {progress !== undefined && (
            <Progress value={progress} className="h-1.5 mt-3" />
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
