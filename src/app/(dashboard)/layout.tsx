import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header userEmail={user.email} />

      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
