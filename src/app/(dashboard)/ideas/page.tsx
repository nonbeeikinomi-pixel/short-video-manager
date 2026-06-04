import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Lightbulb, Filter } from 'lucide-react'
import type { VideoIdea, Channel, VideoStatus } from '@/types'
import { COLOR_THEME_MAP, STATUS_COLORS } from '@/types'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default async function IdeasPage({
  searchParams
}: {
  searchParams: { channel?: string; status?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('video_ideas')
    .select('*, channels(name, icon, color_theme)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (searchParams.channel) query = query.eq('channel_id', searchParams.channel)
  if (searchParams.status) query = query.eq('status', searchParams.status)

  const [{ data: ideas }, { data: channels }] = await Promise.all([
    query,
    supabase.from('channels').select('id, name, icon, color_theme').eq('user_id', user!.id).eq('is_active', true),
  ])

  const statuses: VideoStatus[] = ['企画中', '台本完成', '画像作成済み', '動画作成済み', '投稿予約済み', '投稿済み']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">動画企画</h1>
          <p className="text-gray-500 text-sm mt-1">{ideas?.length || 0}件の企画</p>
        </div>
        <Link href="/ideas/new"
          className="btn-primary bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2.5">
          <Plus size={16} />
          新規生成
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Link href="/ideas"
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            !searchParams.channel && !searchParams.status
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          すべて
        </Link>
        {statuses.map(status => (
          <Link key={status} href={`/ideas?status=${encodeURIComponent(status)}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              searchParams.status === status
                ? STATUS_COLORS[status]
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {status}
          </Link>
        ))}
      </div>

      {/* チャンネルフィルター */}
      {channels && channels.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(channels as Channel[]).map(ch => {
            const cTheme = COLOR_THEME_MAP[ch.color_theme]
            return (
              <Link key={ch.id} href={`/ideas?channel=${ch.id}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  searchParams.channel === ch.id
                    ? cTheme.badge
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {ch.icon} {ch.name}
              </Link>
            )
          })}
        </div>
      )}

      {/* 企画一覧 */}
      {ideas && ideas.length > 0 ? (
        <div className="space-y-3">
          {(ideas as VideoIdea[]).map(idea => {
            const channel = idea.channels as Channel | undefined
            const cTheme = channel ? COLOR_THEME_MAP[channel.color_theme] : null
            return (
              <Link key={idea.id} href={`/ideas/${idea.id}`}
                className="card flex items-start gap-3 hover:shadow-md transition-all">
                {channel && (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cTheme?.gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                    {channel.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm leading-snug">{idea.title}</p>
                  {idea.hook && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{idea.hook}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {channel && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cTheme?.badge} font-medium`}>
                        {channel.name}
                      </span>
                    )}
                    {idea.duration && (
                      <span className="text-xs text-gray-400">{idea.duration}</span>
                    )}
                    <span className="text-xs text-gray-400">{formatDate(idea.created_at)}</span>
                  </div>
                </div>
                <StatusBadge status={idea.status} />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card text-center py-16">
          <Lightbulb size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-bold text-lg">企画がありません</p>
          <p className="text-gray-400 text-sm mt-1">AIを使って最初の企画を生成しましょう</p>
          <Link href="/ideas/new"
            className="btn-primary inline-flex mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3">
            <Plus size={16} />
            企画を生成
          </Link>
        </div>
      )}
    </div>
  )
}
