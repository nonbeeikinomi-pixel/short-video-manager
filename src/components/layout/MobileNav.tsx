'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Tv2, Lightbulb, CalendarDays, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'ホーム' },
  { href: '/channels', icon: Tv2, label: 'チャンネル' },
  { href: '/ideas', icon: Lightbulb, label: '企画' },
  { href: '/calendar', icon: CalendarDays, label: 'カレンダー' },
  { href: '/analytics', icon: BarChart3, label: '分析' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0',
                isActive ? 'text-pink-500' : 'text-gray-400'
              )}
            >
              <item.icon
                size={22}
                className={cn('transition-transform', isActive && 'scale-110')}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
