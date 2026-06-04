'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Clapperboard, Bell } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  title?: string
  userEmail?: string
}

export function Header({ title = '動画マネージャー', userEmail }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Clapperboard size={16} className="text-white" />
          </div>
          <span className="font-black text-sm text-gray-800">{title}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
            <Bell size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
