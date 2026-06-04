import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Settings, Tv2 } from 'lucide-react'
import type { Channel } from '@/types'
import { COLOR_THEME_MAP } from '@/types'

export default async function ChannelsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: channels } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', user!.id)
    .order('sort_order')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">チャンネル管理</h1>
          <p className="text-gray-500 text-sm mt-1">{channels?.length || 0}チャンネル</p>
        </div>
        <Link href="/channels/new"
          className="btn-primary bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2.5">
          <Plus size={16} />
          新規追加
        </Link>
      </div>

      {channels && channels.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {(channels as Channel[]).map(channel => {
            const theme = COLOR_THEME_MAP[channel.color_theme]
            return (
              <div key={channel.id} className="card hover:shadow-md transition-all group">
                {/* チャンネルヘッダー */}
                <div className={`h-24 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mb-4 relative overflow-hidden`}>
                  <span className="text-5xl drop-shadow-lg">{channel.icon}</span>
                  {!channel.is_active && (
                    <span className="absolute top-2 right-2 text-xs bg-black/30 text-white px-2 py-0.5 rounded-full">
                      非アクティブ
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="font-black text-gray-800 text-lg leading-tight">{channel.name}</h3>
                    {channel.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{channel.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {channel.genre && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${theme.badge} font-medium`}>
                        {channel.genre}
                      </span>
                    )}
                    {channel.target_age && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {channel.target_age}
                      </span>
                    )}
                  </div>

                  {channel.platforms && channel.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {channel.platforms.slice(0, 3).map(p => (
                        <span key={p} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Link href={`/ideas/new?channel=${channel.id}`}
                      className={`btn-primary flex-1 ${theme.button} py-2 text-xs`}>
                      ✨ 企画生成
                    </Link>
                    <Link href={`/channels/${channel.id}`}
                      className="btn-primary bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2">
                      <Settings size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card text-center py-16">
          <Tv2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-bold text-lg">チャンネルがありません</p>
          <p className="text-gray-400 text-sm mt-1">最初のチャンネルを追加してみましょう</p>
          <Link href="/channels/new"
            className="btn-primary inline-flex mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3">
            <Plus size={16} />
            チャンネルを追加
          </Link>
        </div>
      )}
    </div>
  )
}
