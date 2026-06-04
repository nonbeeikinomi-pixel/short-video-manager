import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'
import type { VideoIdea, Analytics } from '@/types'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: ideas }, { data: analytics }] = await Promise.all([
    supabase
      .from('video_ideas')
      .select('*')
      .eq('user_id', user!.id)
      .in('status', ['投稿済み', '投稿予約済み'])
      .order('created_at', { ascending: false }),
    supabase
      .from('analytics')
      .select('*, video_ideas(title, channels(name, icon))')
      .eq('user_id', user!.id)
      .order('recorded_at', { ascending: false })
      .limit(20),
  ])

  return (
    <AnalyticsClient
      ideas={ideas as VideoIdea[] || []}
      analytics={analytics as Analytics[] || []}
    />
  )
}
