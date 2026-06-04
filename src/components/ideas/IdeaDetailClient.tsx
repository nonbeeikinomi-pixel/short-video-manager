'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { VideoIdea, Channel, VideoStatus } from '@/types'
import { STATUS_LIST, formatHashtags } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/Badge'
import {
  Copy, Trash2, CalendarPlus, ChevronDown, ChevronUp, Edit,
  Hash, MessageSquare, Mic, Image, Video, FileText, Zap
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ScheduleModal } from '@/components/calendar/ScheduleModal'

interface Props {
  idea: VideoIdea
  channel: Channel
  theme: {
    gradient: string
    button: string
    badge: string
    border: string
    text: string
    light: string
  }
}

interface Section {
  key: keyof VideoIdea
  label: string
  icon: React.ReactNode
  multiline?: boolean
}

const SECTIONS: Section[] = [
  { key: 'hook', label: '冒頭フック', icon: <Zap size={16} />, multiline: false },
  { key: 'story', label: 'ストーリー', icon: <FileText size={16} />, multiline: true },
  { key: 'dialogue', label: 'セリフ', icon: <MessageSquare size={16} />, multiline: true },
  { key: 'narration', label: 'ナレーション', icon: <Mic size={16} />, multiline: true },
  { key: 'telop', label: 'テロップ', icon: <FileText size={16} />, multiline: true },
  { key: 'image_prompt', label: '画像生成プロンプト', icon: <Image size={16} />, multiline: true },
  { key: 'video_prompt', label: '動画生成プロンプト', icon: <Video size={16} />, multiline: true },
  { key: 'thumbnail_text', label: 'サムネイル文言', icon: <FileText size={16} />, multiline: false },
  { key: 'post_text', label: '投稿文', icon: <MessageSquare size={16} />, multiline: true },
  { key: 'cta', label: 'CTA', icon: <Zap size={16} />, multiline: false },
]

function CopyButton({ text }: { text: string }) {
  const copy = () => {
    navigator.clipboard.writeText(text)
    toast.success('コピーしました')
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
      <Copy size={13} />
    </button>
  )
}

export function IdeaDetailClient({ idea, channel, theme }: Props) {
  const [status, setStatus] = useState<VideoStatus>(idea.status)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hook', 'story']))
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editField, setEditField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const updateStatus = async (newStatus: VideoStatus) => {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setStatus(newStatus)
      toast.success('ステータスを更新しました')
    } else {
      toast.error('更新に失敗しました')
    }
  }

  const saveEdit = async () => {
    if (!editField) return
    setSaving(true)
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [editField]: editValue }),
    })
    if (res.ok) {
      toast.success('保存しました')
      setEditField(null)
      router.refresh()
    } else {
      toast.error('保存に失敗しました')
    }
    setSaving(false)
  }

  const deleteIdea = async () => {
    const res = await fetch(`/api/ideas/${idea.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('削除しました')
      router.push('/ideas')
    } else {
      toast.error('削除に失敗しました')
    }
  }

  const openEdit = (key: string, value: string) => {
    setEditField(key)
    setEditValue(value || '')
  }

  return (
    <>
      {/* ステータス & アクション */}
      <div className="card flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1.5">ステータス</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_LIST.map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s as VideoStatus)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  status === s
                    ? 'ring-2 ring-offset-1 shadow-sm scale-105'
                    : 'opacity-50 hover:opacity-80'
                } ${s === '企画中' ? 'bg-gray-100 text-gray-700' :
                  s === '台本完成' ? 'bg-blue-100 text-blue-700' :
                  s === '画像作成済み' ? 'bg-purple-100 text-purple-700' :
                  s === '動画作成済み' ? 'bg-yellow-100 text-yellow-700' :
                  s === '投稿予約済み' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className={`card border-l-4 ${theme.border}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h2 className="font-black text-gray-900 text-lg leading-snug">{idea.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              {idea.duration && <span>⏱ {idea.duration}</span>}
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsScheduleOpen(true)}
              className={`btn-primary ${theme.button} text-xs py-1.5 px-2.5`}
            >
              <CalendarPlus size={13} />
              投稿予定
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="btn-primary bg-red-50 text-red-500 hover:bg-red-100 text-xs py-1.5 px-2.5"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ハッシュタグ */}
      {idea.hashtags && idea.hashtags.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <Hash size={14} className="text-blue-500" /> ハッシュタグ
            </p>
            <CopyButton text={formatHashtags(idea.hashtags)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idea.hashtags.map((tag, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* コンテンツセクション */}
      {SECTIONS.map(section => {
        const value = idea[section.key] as string | null
        if (!value) return null
        const isExpanded = expandedSections.has(section.key)
        const isEditing = editField === section.key

        return (
          <div key={section.key} className="card">
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between"
            >
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className={theme.text}>{section.icon}</span>
                {section.label}
              </span>
              <div className="flex items-center gap-1">
                {!isEditing && <CopyButton text={value} />}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    openEdit(section.key, value)
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                >
                  <Edit size={13} />
                </button>
                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="mt-3">
                {isEditing ? (
                  <div className="space-y-2">
                    {section.multiline ? (
                      <textarea
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        rows={6}
                        className="input-base focus:ring-pink-400 resize-y text-xs"
                        autoFocus
                      />
                    ) : (
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="input-base focus:ring-pink-400 text-sm"
                        autoFocus
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditField(null)}
                        className="btn-primary flex-1 bg-gray-100 text-gray-700 text-xs py-2"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className={`btn-primary flex-1 ${theme.button} text-xs py-2`}
                      >
                        {saving ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm text-gray-600 leading-relaxed ${section.multiline ? 'whitespace-pre-wrap' : ''}`}>
                    {value}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* 投稿スケジュールモーダル */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        idea={idea}
        channel={channel}
      />

      {/* 削除確認 */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="企画を削除" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">「{idea.title}」を削除しますか？この操作は取り消せません。</p>
          <div className="flex gap-2">
            <button onClick={() => setIsDeleteOpen(false)}
              className="btn-primary flex-1 bg-gray-100 text-gray-700">
              キャンセル
            </button>
            <button onClick={deleteIdea}
              className="btn-primary flex-1 bg-red-500 hover:bg-red-600 text-white">
              <Trash2 size={14} />
              削除
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
