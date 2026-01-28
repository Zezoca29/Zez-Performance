'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserProfile } from '@/hooks/use-user'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: profile } = useUserProfile()
  const today = new Date()

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">
              {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {profile?.full_name && (
            <span className="text-sm font-medium hidden sm:block">
              Ola, {profile.full_name.split(' ')[0]}
            </span>
          )}
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
