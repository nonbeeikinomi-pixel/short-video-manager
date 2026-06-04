'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Tv2,
  Lightbulb,
  CalendarDays,
  BarChart3,
  FolderOpen,
  LogOut,
  Clapperboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/channels', icon: Tv2, label: 'チャンネル' },
  { href: '/ideas', icon: Lightbulb, label: '動画企画' },
  { href: '/calendar', icon: CalendarDays, label: 'カレンダー' },
  { href: '/analytics', icon: BarChart3, label: '分析' },
  { href: '/assets', icon: FolderOpen, label: '素材管理' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-slate-900 text-white fixed left-0 top-0 bottom-0 z-50">
      {/* ロゴ */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Clapperboard size={20} />
          </div>
          <div>
            <p className="font-black text-sm leading-tight">動画マネージャー</p>
            <p className="text-slate-400 text-xs">量産システム</p>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* ログアウト */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all w-full"
        >
          <LogOut size={18} />
          ログアウト
        </button>
      </div>
    </aside>
  )
}
