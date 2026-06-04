'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Character } from '@/types'
import { User, Plus, Edit, Trash2, Save, X, Bot } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

interface CharacterSectionProps {
  channelId: string
  characters: Character[]
}

const emptyForm = {
  name: '',
  description: '',
  personality: '',
  appearance: '',
  voice_style: '',
  is_ai: false,
  ai_disclosure_text: 'このキャラクターはAIが生成したフィクションのキャラクターです',
  image_prompt_template: '',
  post_template: '',
  required_elements_text: '',
  forbidden_elements_text: '',
}

export function CharacterSection({ channelId, characters }: CharacterSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Character | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const supabase = createClient()
  const router = useRouter()

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))

  const openNew = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setIsOpen(true)
  }

  const openEdit = (char: Character) => {
    setEditTarget(char)
    setForm({
      name: char.name,
      description: char.description || '',
      personality: char.personality || '',
      appearance: char.appearance || '',
      voice_style: char.voice_style || '',
      is_ai: char.is_ai,
      ai_disclosure_text: char.ai_disclosure_text || '',
      image_prompt_template: char.image_prompt_template || '',
      post_template: char.post_template || '',
      required_elements_text: char.required_elements?.join('\n') || '',
      forbidden_elements_text: char.forbidden_elements?.join('\n') || '',
    })
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('キャラクター名を入力してください')
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        channel_id: channelId,
        user_id: user!.id,
        name: form.name,
        description: form.description,
        personality: form.personality,
        appearance: form.appearance,
        voice_style: form.voice_style,
        is_ai: form.is_ai,
        ai_disclosure_text: form.ai_disclosure_text,
        image_prompt_template: form.image_prompt_template,
        post_template: form.post_template,
        required_elements: form.required_elements_text.split('\n').map(s => s.trim()).filter(Boolean),
        forbidden_elements: form.forbidden_elements_text.split('\n').map(s => s.trim()).filter(Boolean),
      }

      if (editTarget) {
        const { error } = await supabase.from('characters').update(payload).eq('id', editTarget.id)
        if (error) throw error
        toast.success('キャラクターを更新しました')
      } else {
        const { error } = await supabase.from('characters').insert(payload)
        if (error) throw error
        toast.success('キャラクターを追加しました')
      }

      setIsOpen(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このキャラクターを削除しますか？')) return
    const { error } = await supabase.from('characters').delete().eq('id', id)
    if (error) {
      toast.error('削除に失敗しました')
    } else {
      toast.success('削除しました')
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title flex items-center gap-2">
          <User size={18} className="text-pink-500" />
          キャラクター設定
        </h2>
        <button onClick={openNew}
          className="btn-primary bg-pink-500 hover:bg-pink-600 text-white text-sm py-1.5">
          <Plus size={14} />
          追加
        </button>
      </div>

      {characters.length > 0 ? (
        <div className="space-y-2">
          {characters.map(char => (
            <div key={char.id} className="card flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${char.is_ai ? 'bg-purple-100' : 'bg-pink-100'} flex items-center justify-center flex-shrink-0`}>
                {char.is_ai ? <Bot size={18} className="text-purple-500" /> : <User size={18} className="text-pink-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800 text-sm">{char.name}</p>
                  {char.is_ai && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">AI</span>
                  )}
                </div>
                {char.personality && <p className="text-xs text-gray-500 truncate">{char.personality}</p>}
                {char.required_elements?.length > 0 && (
                  <p className="text-xs text-green-600 mt-0.5">必須要素: {char.required_elements.length}件</p>
                )}
                {char.forbidden_elements?.length > 0 && (
                  <p className="text-xs text-red-500 mt-0.5">NG: {char.forbidden_elements.length}件</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(char)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(char.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-6 border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">キャラクターが未設定です</p>
          <button onClick={openNew} className="text-pink-500 text-sm font-medium mt-1 hover:underline">
            キャラクターを追加する
          </button>
        </div>
      )}

      {/* キャラクター編集モーダル */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editTarget ? 'キャラクター編集' : 'キャラクター追加'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label-base">キャラクター名 *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="例：おしりひめ" className="input-base focus:ring-pink-400" />
            </div>
            <div className="col-span-2">
              <label className="label-base">説明</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={2} placeholder="キャラクターの概要..." className="input-base focus:ring-pink-400 resize-none" />
            </div>
            <div>
              <label className="label-base">性格・キャラ設定</label>
              <textarea value={form.personality} onChange={e => set('personality', e.target.value)}
                rows={3} placeholder="例：明るく元気..." className="input-base focus:ring-pink-400 resize-none" />
            </div>
            <div>
              <label className="label-base">外見・ビジュアル</label>
              <textarea value={form.appearance} onChange={e => set('appearance', e.target.value)}
                rows={3} placeholder="例：ピンク色の..." className="input-base focus:ring-pink-400 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="label-base">話し方・声のスタイル</label>
              <input type="text" value={form.voice_style} onChange={e => set('voice_style', e.target.value)}
                placeholder="例：元気でかわいらしい口調" className="input-base focus:ring-pink-400" />
            </div>
          </div>

          {/* AIキャラクター設定 */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <input type="checkbox" id="is_ai" checked={form.is_ai}
              onChange={e => set('is_ai', e.target.checked)}
              className="w-4 h-4 text-purple-500 rounded" />
            <label htmlFor="is_ai" className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Bot size={16} />
              AIキャラクターとして設定する
            </label>
          </div>
          {form.is_ai && (
            <div>
              <label className="label-base">AI明示テキスト</label>
              <input type="text" value={form.ai_disclosure_text} onChange={e => set('ai_disclosure_text', e.target.value)}
                className="input-base focus:ring-purple-400" />
            </div>
          )}

          {/* 動画ルール */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base text-green-700">必須要素（1行1要素）</label>
              <textarea value={form.required_elements_text}
                onChange={e => set('required_elements_text', e.target.value)}
                rows={4} placeholder={'例：\n困っている人\nキャラクター登場\n解決\n最後に歌'}
                className="input-base focus:ring-green-400 resize-none text-xs" />
            </div>
            <div>
              <label className="label-base text-red-600">NG要素（1行1要素）</label>
              <textarea value={form.forbidden_elements_text}
                onChange={e => set('forbidden_elements_text', e.target.value)}
                rows={4} placeholder={'例：\n暴力的な表現\nいじめ\n怖すぎる表現'}
                className="input-base focus:ring-red-400 resize-none text-xs" />
            </div>
          </div>

          <div>
            <label className="label-base">画像生成プロンプトテンプレート</label>
            <textarea value={form.image_prompt_template}
              onChange={e => set('image_prompt_template', e.target.value)}
              rows={2} placeholder="Stable Diffusion / Midjourney向けのベースプロンプト（英語）"
              className="input-base focus:ring-pink-400 resize-none text-xs" />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setIsOpen(false)}
              className="btn-primary flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
              <X size={16} /> キャンセル
            </button>
            <button onClick={handleSave} disabled={loading}
              className="btn-primary flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Save size={16} />}
              保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
