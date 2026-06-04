'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { VideoIdea, Channel } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { CalendarPlus, Save } from 'lucide-react'
import { PLATFORMS } from '@/lib/utils'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  idea?: VideoIdea
  channel?: Channel
  defaultDate?: string
}

export function ScheduleModal({ isOpen, onClose, idea, channel, defaultDate }: ScheduleModalProps) {
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    postDate: defaultDate || today,
    postTime: '18:00',
    platform: channel?.platforms?.[0] || 'TikTok',
    title: idea?.title || '',
    notes: '',
  })
  const router = useRouter()

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!channel && !idea?.channel_id) {
      toast.error('チャンネルが必要です')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel?.id || idea?.channel_id,
          videoIdeaId: idea?.id || null,
          postDate: form.postDate,
          postTime: form.postTime,
          platform: form.platform,
          title: form.title,
          notes: form.notes,
          status: idea?.status || '企画中',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('投稿予定を登録しました')
      onClose()
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const platforms = channel?.platforms?.length ? channel.platforms : PLATFORMS

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="投稿予定を登録" size="md">
      <div className="space-y-4">
        {idea && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">対象企画</p>
            <p className="font-bold text-gray-800 text-sm">{idea.title}</p>
          </div>
        )}

        <div>
          <label className="label-base">タイトル</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="投稿タイトル" className="input-base focus:ring-pink-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">投稿日</label>
            <input type="date" value={form.postDate} onChange={e => set('postDate', e.target.value)}
              className="input-base focus:ring-pink-400" />
          </div>
          <div>
            <label className="label-base">投稿時間</label>
            <input type="time" value={form.postTime} onChange={e => set('postTime', e.target.value)}
              className="input-base focus:ring-pink-400" />
          </div>
        </div>

        <div>
          <label className="label-base">プラットフォーム</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map(p => (
              <button key={p} type="button" onClick={() => set('platform', p)}
                className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                  form.platform === p
                    ? 'bg-pink-500 text-white font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-base">メモ</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            rows={2} placeholder="備考・注意事項など..." className="input-base focus:ring-pink-400 resize-none" />
        </div>

        <button onClick={handleSave} disabled={loading}
          className="btn-primary w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3">
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Save size={16} />}
          投稿予定を登録
        </button>
      </div>
    </Modal>
  )
}
