'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Droplets,
  ListTodo,
  Dumbbell,
  Apple,
  BookOpen,
  Wallet,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hydration', label: 'Hidratacao', icon: Droplets },
  { href: '/routine', label: 'Rotina', icon: ListTodo },
  { href: '/gym', label: 'Academia', icon: Dumbbell },
  { href: '/diet', label: 'Dieta', icon: Apple },
  { href: '/reading', label: 'Leitura', icon: BookOpen },
  { href: '/finances', label: 'Financas', icon: Wallet },
  { href: '/skills', label: 'Skills', icon: Sparkles },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border">
      <div className="p-4 flex justify-center">
        <Image
          src="/logo.png"
          alt="Zez Performance"
          width={120}
          height={120}
        />
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <ul className="space-y-1">
          <li>
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Settings className="h-5 w-5" />
              Configuracoes
            </Link>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
