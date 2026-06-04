import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Tv2, Lightbulb, CalendarDays, BarChart3, Plus, TrendingUp, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { COLOR_THEME_MAP } from '@/types'
import type { Channel, VideoIdea, PostSchedule } from '@/types'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: channels },
    { data: recentIdeas },
    { data: upcomingPosts },
  ] = await Promise.all([
    supabase.from('channels').select('*').eq('user_id', user!.id).eq('is_active', true).order('sort_order'),
    supabase.from('video_ideas').select('*, channels(name, icon, color_theme)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('post_schedule').select('*, channels(name, icon, color_theme), video_ideas(title)').eq('user_id', user!.id).gte('post_date', new Date().toISOString().split('T')[0]).order('post_date').limit(5),
  ])

  const stats = [
    { label: 'チャンネル数', value: channels?.length || 0, icon: Tv2, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: '動画企画数', value: recentIdeas?.length || 0, icon: Lightbulb, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: '今後の投稿', value: upcomingPosts?.length || 0, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-50' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-1">ショート動画量産システムへようこそ</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="card flex flex-col gap-2">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* クイックアクション */}
      <div>
        <h2 className="section-title mb-3">クイックアクション</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/ideas/new" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">企画を生成</p>
              <p className="text-xs text-gray-500">AIで新しい企画を作成</p>
            </div>
          </Link>
          <Link href="/calendar" className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">投稿管理</p>
              <p className="text-xs text-gray-500">スケジュールを確認</p>
            </div>
          </Link>
        </div>
      </div>

      {/* チャンネル一覧 */}
      {channels && channels.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">チャンネル</h2>
            <Link href="/channels" className="text-sm text-pink-500 font-medium">すべて見る</Link>
          </div>
          <div className="space-y-2">
            {(channels as Channel[]).map(channel => {
              const theme = COLOR_THEME_MAP[channel.color_theme]
              return (
                <Link key={channel.id} href={`/channels/${channel.id}`}
                  className="card flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-lg`}>
                    {channel.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{channel.name}</p>
                    <p className="text-xs text-gray-500 truncate">{channel.genre || channel.target_age || '設定なし'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${theme.badge} font-medium`}>
                    {channel.is_active ? 'アクティブ' : '非アクティブ'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* チャンネルがない場合 */}
      {(!channels || channels.length === 0) && (
        <div className="card text-center py-10">
          <span className="text-5xl">📺</span>
          <p className="text-gray-600 font-medium mt-3">チャンネルが未設定です</p>
          <p className="text-gray-400 text-sm mt-1">チャンネルを追加して始めましょう</p>
          <Link href="/channels/new"
            className="btn-primary inline-flex mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
            <Plus size={16} />
            チャンネルを追加
          </Link>
        </div>
      )}

      {/* 最近の企画 */}
      {recentIdeas && recentIdeas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-500" />
              最近の企画
            </h2>
            <Link href="/ideas" className="text-sm text-pink-500 font-medium">すべて見る</Link>
          </div>
          <div className="space-y-2">
            {(recentIdeas as VideoIdea[]).map(idea => (
              <Link key={idea.id} href={`/ideas/${idea.id}`}
                className="card flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{idea.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(idea.created_at)}</p>
                </div>
                <StatusBadge status={idea.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 投稿予定 */}
      {upcomingPosts && upcomingPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              投稿予定
            </h2>
            <Link href="/calendar" className="text-sm text-pink-500 font-medium">カレンダーを見る</Link>
          </div>
          <div className="space-y-2">
            {(upcomingPosts as PostSchedule[]).map(post => (
              <div key={post.id} className="card flex items-center gap-3">
                <div className="text-center min-w-[48px]">
                  <p className="text-lg font-black text-gray-800">{new Date(post.post_date).getDate()}</p>
                  <p className="text-xs text-gray-500">{new Date(post.post_date).toLocaleDateString('ja-JP', { month: 'short' })}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {post.title || post.video_ideas?.title || '未タイトル'}
                  </p>
                  <p className="text-xs text-gray-500">{post.platform} {post.post_time?.slice(0, 5)}</p>
                </div>
                <StatusBadge status={post.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
