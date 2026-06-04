import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, User } from 'lucide-react'
import type { Channel, Character, VideoIdea } from '@/types'
import { COLOR_THEME_MAP } from '@/types'
import { StatusBadge } from '@/components/ui/Badge'
import { CharacterSection } from '@/components/channels/CharacterSection'

export default async function ChannelDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: channel }, { data: characters }, { data: ideas }] = await Promise.all([
    supabase.from('channels').select('*').eq('id', params.id).eq('user_id', user!.id).single(),
    supabase.from('characters').select('*').eq('channel_id', params.id).eq('user_id', user!.id),
    supabase.from('video_ideas').select('*').eq('channel_id', params.id).eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!channel) notFound()

  const ch = channel as Channel
  const theme = COLOR_THEME_MAP[ch.color_theme]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/channels" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            {ch.icon} {ch.name}
          </h1>
          <p className="text-gray-500 text-xs">{ch.genre} / {ch.target_age}</p>
        </div>
        <Link href={`/channels/${ch.id}/edit`}
          className="btn-primary bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2">
          <Edit size={14} />
        </Link>
      </div>

      {/* チャンネルバナー */}
      <div className={`h-32 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-7xl drop-shadow-lg">{ch.icon}</span>
        <div className="absolute bottom-3 left-4 text-white">
          <p className="font-black text-lg">{ch.name}</p>
          {ch.description && <p className="text-white/80 text-xs">{ch.description}</p>}
        </div>
      </div>

      {/* チャンネル情報 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">ジャンル</p>
          <p className="font-bold text-gray-800">{ch.genre || '未設定'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">対象年齢</p>
          <p className="font-bold text-gray-800">{ch.target_age || '未設定'}</p>
        </div>
      </div>

      {/* 投稿プラットフォーム */}
      {ch.platforms && ch.platforms.length > 0 && (
        <div className="card">
          <p className="text-xs text-gray-500 mb-2">投稿先プラットフォーム</p>
          <div className="flex flex-wrap gap-2">
            {ch.platforms.map(p => (
              <span key={p} className={`text-xs px-3 py-1 rounded-full ${theme.badge} font-medium`}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* キャラクター設定 */}
      <CharacterSection channelId={ch.id} characters={characters as Character[] || []} />

      {/* 動画企画 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">動画企画</h2>
          <Link href={`/ideas/new?channel=${ch.id}`}
            className={`btn-primary ${theme.button} text-sm py-2`}>
            <Plus size={14} />
            企画生成
          </Link>
        </div>

        {ideas && ideas.length > 0 ? (
          <div className="space-y-2">
            {(ideas as VideoIdea[]).map(idea => (
              <Link key={idea.id} href={`/ideas/${idea.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{idea.title}</p>
                  <p className="text-xs text-gray-500">{idea.duration} / {new Date(idea.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
                <StatusBadge status={idea.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-500 text-sm">まだ企画がありません</p>
            <Link href={`/ideas/new?channel=${ch.id}`}
              className={`btn-primary inline-flex mt-3 ${theme.button} text-sm`}>
              <Plus size={14} />
              最初の企画を生成
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
