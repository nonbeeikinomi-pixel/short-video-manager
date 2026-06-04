import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { VideoIdea, Channel } from '@/types'
import { COLOR_THEME_MAP } from '@/types'
import { IdeaDetailClient } from '@/components/ideas/IdeaDetailClient'

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: idea } = await supabase
    .from('video_ideas')
    .select('*, channels(*)')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!idea) notFound()

  const channel = idea.channels as Channel
  const theme = COLOR_THEME_MAP[channel?.color_theme || 'pink']

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/ideas"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black text-gray-900 truncate">{idea.title}</h1>
          {channel && (
            <p className="text-xs text-gray-500">{channel.icon} {channel.name}</p>
          )}
        </div>
      </div>

      <IdeaDetailClient idea={idea as VideoIdea} channel={channel} theme={theme} />
    </div>
  )
}
