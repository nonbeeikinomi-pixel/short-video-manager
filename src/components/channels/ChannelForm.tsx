'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Channel } from '@/types'
import { COLOR_OPTIONS, PLATFORMS } from '@/lib/utils'
import { Save, Plus, X } from 'lucide-react'

const ICONS = ['📺', '🎬', '🎥', '🌸', '🍶', '👸', '🌟', '🎵', '🍕', '🎮', '🌈', '💫', '🦄', '🐶', '🐱', '🍜', '🏯', '🌊', '🎏', '🦋']

interface ChannelFormProps {
  channel?: Channel
  onSuccess?: () => void
}

export function ChannelForm({ channel, onSuccess }: ChannelFormProps) {
  const isEdit = !!channel
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const [form, setForm] = useState({
    name: channel?.name || '',
    description: channel?.description || '',
    genre: channel?.genre || '',
    target_age: channel?.target_age || '',
    color_theme: channel?.color_theme || 'pink',
    icon: channel?.icon || '📺',
    style: channel?.style || 'カラフル',
    platforms: channel?.platforms || ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
  })

  const set = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const togglePlatform = (platform: string) => {
    const current = form.platforms
    if (current.includes(platform)) {
      set('platforms', current.filter(p => p !== platform))
    } else {
      set('platforms', [...current, platform])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('チャンネル名を入力してください')
      return
    }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未ログイン')

      const payload = { ...form, user_id: user.id }

      if (isEdit) {
        const { error } = await supabase.from('channels').update(payload).eq('id', channel.id)
        if (error) throw error
        toast.success('チャンネルを更新しました')
      } else {
        const { error } = await supabase.from('channels').insert(payload)
        if (error) throw error
        toast.success('チャンネルを作成しました')
      }

      onSuccess?.()
      router.push('/channels')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* チャンネル名 */}
      <div>
        <label className="label-base">チャンネル名 <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="例：おしりひめワールド"
          className="input-base focus:ring-pink-400"
          required
        />
      </div>

      {/* 説明 */}
      <div>
        <label className="label-base">チャンネル説明</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="チャンネルの概要を入力..."
          rows={3}
          className="input-base focus:ring-pink-400 resize-none"
        />
      </div>

      {/* ジャンル・対象年齢 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-base">ジャンル</label>
          <input
            type="text"
            value={form.genre}
            onChange={e => set('genre', e.target.value)}
            placeholder="例：子供向け"
            className="input-base focus:ring-pink-400"
          />
        </div>
        <div>
          <label className="label-base">対象年齢</label>
          <input
            type="text"
            value={form.target_age}
            onChange={e => set('target_age', e.target.value)}
            placeholder="例：3〜8歳"
            className="input-base focus:ring-pink-400"
          />
        </div>
      </div>

      {/* アイコン選択 */}
      <div>
        <label className="label-base">アイコン</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => set('icon', icon)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                form.icon === icon
                  ? 'bg-pink-100 ring-2 ring-pink-400 scale-110'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* カラーテーマ */}
      <div>
        <label className="label-base">カラーテーマ</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {COLOR_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('color_theme', opt.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all ${
                form.color_theme === opt.value
                  ? 'ring-2 ring-offset-1 shadow-sm font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              style={form.color_theme === opt.value ? {
                backgroundColor: opt.color + '20',
                color: opt.color,
                outline: `2px solid ${opt.color}`,
              } : {}}
            >
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: opt.color }}
              />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* スタイル */}
      <div>
        <label className="label-base">UIスタイル</label>
        <div className="flex gap-2">
          {['カラフル', '和風・上品', 'シンプル', 'ポップ'].map(style => (
            <button
              key={style}
              type="button"
              onClick={() => set('style', style)}
              className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                form.style === style
                  ? 'bg-pink-500 text-white font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 投稿プラットフォーム */}
      <div>
        <label className="label-base">投稿プラットフォーム</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PLATFORMS.map(platform => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                form.platforms.includes(platform)
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            保存中...
          </span>
        ) : (
          <>
            <Save size={16} />
            {isEdit ? 'チャンネルを更新' : 'チャンネルを作成'}
          </>
        )}
      </button>
    </form>
  )
}
