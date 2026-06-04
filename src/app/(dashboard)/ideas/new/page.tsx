'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Sparkles, AlertCircle, KeyRound } from 'lucide-react'
import Link from 'next/link'
import type { Channel } from '@/types'
import { COLOR_THEME_MAP } from '@/types'
import { AiGeneratingState } from '@/components/ui/LoadingSpinner'

export default function NewIdeaPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [theme, setTheme] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiError, setApiError] = useState<{ type: 'key_missing' | 'quota' | 'general'; message: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchChannels = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('sort_order')
      if (data) {
        setChannels(data as Channel[])
        const preselect = searchParams.get('channel')
        if (preselect && data.find(c => c.id === preselect)) {
          setSelectedChannel(preselect)
        } else if (data.length > 0) {
          setSelectedChannel(data[0].id)
        }
      }
    }
    fetchChannels()
  }, [])

  const handleGenerate = async () => {
    if (!selectedChannel) {
      toast.error('チャンネルを選択してください')
      return
    }
    setIsGenerating(true)
    setApiError(null)

    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: selectedChannel, theme: theme || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg: string = data.error || 'AI生成に失敗しました'
        if (msg.includes('APIキーが設定されていません')) {
          setApiError({ type: 'key_missing', message: msg })
        } else if (res.status === 429 || msg.includes('利用制限')) {
          setApiError({ type: 'quota', message: msg })
        } else {
          setApiError({ type: 'general', message: msg })
        }
        toast.error(msg)
        return
      }

      toast.success('企画が生成されました！')
      router.push(`/ideas/${data.idea.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI生成に失敗しました'
      setApiError({ type: 'general', message: msg })
      toast.error(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedChannelData = channels.find(c => c.id === selectedChannel)
  const theme_ = selectedChannelData ? COLOR_THEME_MAP[selectedChannelData.color_theme] : null

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/ideas" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">AI企画生成</h1>
          <p className="text-gray-500 text-xs">AIが動画企画を自動生成します</p>
        </div>
      </div>

      {/* API エラーバナー */}
      {apiError && (
        <div className={`flex items-start gap-3 rounded-2xl p-4 ${
          apiError.type === 'key_missing'
            ? 'bg-amber-50 border border-amber-200'
            : apiError.type === 'quota'
            ? 'bg-orange-50 border border-orange-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {apiError.type === 'key_missing'
            ? <KeyRound size={18} className="text-amber-500 mt-0.5 shrink-0" />
            : <AlertCircle size={18} className={`mt-0.5 shrink-0 ${apiError.type === 'quota' ? 'text-orange-500' : 'text-red-500'}`} />
          }
          <div>
            <p className={`font-bold text-sm ${
              apiError.type === 'key_missing' ? 'text-amber-800'
              : apiError.type === 'quota' ? 'text-orange-800'
              : 'text-red-800'
            }`}>
              {apiError.type === 'key_missing' ? 'Gemini APIキーが設定されていません'
               : apiError.type === 'quota' ? 'APIリクエスト制限'
               : 'エラーが発生しました'}
            </p>
            <p className={`text-xs mt-1 ${
              apiError.type === 'key_missing' ? 'text-amber-700'
              : apiError.type === 'quota' ? 'text-orange-700'
              : 'text-red-700'
            }`}>{apiError.message}</p>
            {apiError.type === 'key_missing' && (
              <p className="text-xs mt-2 text-amber-600">
                Netlify の環境変数に <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> を設定してください。
              </p>
            )}
            {apiError.type === 'quota' && (
              <p className="text-xs mt-2 text-orange-600">
                1〜2分待ってから再度お試しください。
              </p>
            )}
          </div>
        </div>
      )}

      {isGenerating ? (
        <div className="card py-8">
          <AiGeneratingState message="Gemini AIが動画企画を作成中..." />
          <div className="mt-4 space-y-2 px-4">
            {['タイトル', 'ストーリー', 'セリフ', 'ナレーション', 'テロップ', '画像プロンプト', '投稿文', 'ハッシュタグ'].map((item, i) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                {item}を生成中...
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* チャンネル選択 */}
          <div className="card space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-pink-100 text-pink-500 rounded-lg flex items-center justify-center text-xs font-black">1</span>
              チャンネルを選択
            </h2>

            {channels.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">チャンネルがありません</p>
                <Link href="/channels/new" className="text-pink-500 text-sm font-medium hover:underline mt-1 inline-block">
                  チャンネルを追加する
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {channels.map(channel => {
                  const cTheme = COLOR_THEME_MAP[channel.color_theme]
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        selectedChannel === channel.id
                          ? `${cTheme.border} ${cTheme.light}`
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cTheme.gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                        {channel.icon}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-800 text-sm">{channel.name}</p>
                        <p className="text-xs text-gray-500">{channel.target_age || channel.genre || ''}</p>
                      </div>
                      {selectedChannel === channel.id && (
                        <div className={`w-5 h-5 rounded-full ${cTheme.button.split(' ')[0]} flex items-center justify-center`}>
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* テーマ入力 */}
          <div className="card space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-100 text-purple-500 rounded-lg flex items-center justify-center text-xs font-black">2</span>
              テーマ・方向性（任意）
            </h2>
            <div>
              <textarea
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="例：春をテーマにした企画、日本酒クイズ形式、仙台グルメとのペアリングなど"
                rows={3}
                className="input-base focus:ring-purple-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">空欄の場合はAIが自動でテーマを決めます</p>
            </div>
          </div>

          {/* 生成ボタン */}
          <button
            onClick={handleGenerate}
            disabled={!selectedChannel || channels.length === 0}
            className={`btn-primary w-full py-4 text-base font-black ${
              theme_ ? theme_.button : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
            }`}
          >
            <Sparkles size={20} />
            AIで企画を生成する
          </button>

          <p className="text-center text-xs text-gray-400">
            ※ Google Gemini 1.5 Flash を使用します。生成には5〜15秒かかります。
          </p>
        </>
      )}
    </div>
  )
}
