import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from '@/components/calendar/CalendarClient'
import type { PostSchedule, Channel } from '@/types'

export default async function CalendarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split('T')[0]

  const [{ data: schedules }, { data: channels }] = await Promise.all([
    supabase
      .from('post_schedule')
      .select('*, channels(name, icon, color_theme), video_ideas(title)')
      .eq('user_id', user!.id)
      .gte('post_date', firstDay)
      .lte('post_date', lastDay)
      .order('post_date')
      .order('post_time'),
    supabase
      .from('channels')
      .select('id, name, icon, color_theme, platforms')
      .eq('user_id', user!.id)
      .eq('is_active', true),
  ])

  return (
    <CalendarClient
      schedules={schedules as PostSchedule[] || []}
      channels={channels as Channel[] || []}
    />
  )
}
