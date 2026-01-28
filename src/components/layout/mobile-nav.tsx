'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Droplets,
  ListTodo,
  Dumbbell,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/hydration', label: 'Agua', icon: Droplets },
  { href: '/routine', label: 'Tarefas', icon: ListTodo },
  { href: '/gym', label: 'Gym', icon: Dumbbell },
  { href: '/more', label: 'Mais', icon: MoreHorizontal },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <ul className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/more' && ['/diet', '/reading', '/finances', '/skills', '/settings'].includes(pathname))

          return (
            <li key={item.href}>
              <Link
                href={item.href === '/more' ? '/diet' : item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
