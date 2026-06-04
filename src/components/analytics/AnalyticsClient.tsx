'use client'

import { useState } from 'react'
import type { VideoIdea, Analytics, AiAnalysis } from '@/types'
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle, Bookmark, Share2, Users, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { AiGeneratingState } from '@/components/ui/LoadingSpinner'

interface Props {
  ideas: VideoIdea[]
  analytics: Analytics[]
}

export function AnalyticsClient({ ideas, analytics }: Props) {
  const [selectedIdea, setSelectedIdea] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null)
  const [form, setForm] = useState({
    views: '',
    likes: '',
    comments: '',
    saves: '',
    shares: '',
    follower_gain: '',
    notes: '',
  })

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (generateAi: boolean) => {
    if (!selectedIdea) {
      toast.error('動画を選択してください')
      return
    }
    setLoading(true)
    setAiAnalysis(null)

    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoIdeaId: selectedIdea,
          views: Number(form.views) || 0,
          likes: Number(form.likes) || 0,
          comments: Number(form.comments) || 0,
          saves: Number(form.saves) || 0,
          shares: Number(form.shares) || 0,
          follower_gain: Number(form.follower_gain) || 0,
          notes: form.notes,
          generateAiAnalysis: generateAi,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('分析データを保存しました')
      if (data.aiAnalysis) setAiAnalysis(data.aiAnalysis)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const metrics = [
    { key: 'views', label: '再生数', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { key: 'likes', label: 'いいね数', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { key: 'comments', label: 'コメント数', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { key: 'saves', label: '保存数', icon: Bookmark, color: 'text-purple-500', bg: 'bg-purple-50' },
    { key: 'shares', label: 'シェア数', icon: Share2, color: 'text-orange-500', bg: 'bg-orange-50' },
    { key: 'follower_gain', label: 'フォロワー増加', icon: Users, color: 'text-teal-500', bg: 'bg-teal-50' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900">分析管理</h1>
        <p className="text-gray-500 text-sm mt-1">投稿実績を入力してAI分析を受け取る</p>
      </div>

      {/* データ入力フォーム */}
      <div className="card space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <BarChart3 size={18} className="text-pink-500" />
          分析データ入力
        </h2>

        {/* 動画選択 */}
        <div>
          <label className="label-base">対象動画</label>
          <select
            value={selectedIdea}
            onChange={e => setSelectedIdea(e.target.value)}
            className="input-base focus:ring-pink-400"
          >
            <option value="">動画を選択...</option>
            {ideas.map(idea => (
              <option key={idea.id} value={idea.id}>{idea.title}</option>
            ))}
          </select>
          {ideas.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">投稿済み・投稿予約済みの企画がありません</p>
          )}
        </div>

        {/* メトリクス入力 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map(metric => (
            <div key={metric.key}>
              <label className="label-base flex items-center gap-1.5">
                <metric.icon size={13} className={metric.color} />
                {metric.label}
              </label>
              <input
                type="number"
                min="0"
                value={form[metric.key as keyof typeof form]}
                onChange={e => set(metric.key, e.target.value)}
                placeholder="0"
                className="input-base focus:ring-pink-400"
              />
            </div>
          ))}
        </div>

        {/* メモ */}
        <div>
          <label className="label-base">メモ・気づき</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="バズった理由、改善点、特記事項など..."
            className="input-base focus:ring-pink-400 resize-none"
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="btn-primary flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3"
          >
            保存のみ
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="btn-primary flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3"
          >
            <Sparkles size={16} />
            AI分析を実行
          </button>
        </div>
      </div>

      {/* AI分析中 */}
      {loading && (
        <div className="card">
          <AiGeneratingState message="AIがデータを分析中..." />
        </div>
      )}

      {/* AI分析結果 */}
      {aiAnalysis && !loading && (
        <div className="card space-y-5 border-2 border-purple-200">
          <h2 className="section-title flex items-center gap-2">
            <Sparkles size={18} className="text-purple-500" />
            AI分析レポート
          </h2>

          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed">{aiAnalysis.summary}</p>
          </div>

          <div>
            <h3 className="font-bold text-green-700 text-sm mb-2 flex items-center gap-1.5">
              <TrendingUp size={14} /> 伸びた理由
            </h3>
            <ul className="space-y-1.5">
              {aiAnalysis.good_reasons?.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {aiAnalysis.bad_reasons && aiAnalysis.bad_reasons.length > 0 && (
            <div>
              <h3 className="font-bold text-red-600 text-sm mb-2">伸びなかった理由</h3>
              <ul className="space-y-1.5">
                {aiAnalysis.bad_reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-bold text-blue-600 text-sm mb-2">改善案</h3>
            <ul className="space-y-1.5">
              {aiAnalysis.improvements?.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-purple-100 pt-4">
            <h3 className="font-bold text-purple-700 text-sm mb-3 flex items-center gap-1.5">
              <Sparkles size={14} /> 次に作るべき企画
            </h3>
            <div className="space-y-2">
              {aiAnalysis.next_ideas?.map((idea, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl">
                  <span className="text-purple-500 font-black text-sm flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-gray-700">{idea}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 過去の分析履歴 */}
      {analytics.length > 0 && (
        <div>
          <h2 className="section-title mb-3">分析履歴</h2>
          <div className="space-y-3">
            {analytics.map(a => (
              <div key={a.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {a.video_ideas?.title || '動画'}
                    </p>
                    <p className="text-xs text-gray-400">{a.recorded_at}</p>
                  </div>
                  {a.views > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">
                      {a.views.toLocaleString()}回再生
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'いいね', value: a.likes, icon: '❤️' },
                    { label: 'コメント', value: a.comments, icon: '💬' },
                    { label: '保存', value: a.saves, icon: '🔖' },
                    { label: 'シェア', value: a.shares, icon: '📤' },
                    { label: 'フォロワー増', value: a.follower_gain, icon: '👥' },
                  ].map(m => (
                    <div key={m.label} className="text-center bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">{m.icon}</p>
                      <p className="font-bold text-gray-700 text-sm">{m.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
