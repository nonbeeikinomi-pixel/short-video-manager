'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, Lock, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
        toast.success('確認メールを送信しました。メールをご確認ください。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました'
      if (message.includes('Invalid login credentials')) {
        toast.error('メールアドレスまたはパスワードが正しくありません')
      } else {
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-20" />

      <div className="relative w-full max-w-md">
        {/* ロゴエリア */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-4 animate-bounce-gentle">
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-3xl font-black text-white">動画マネージャー</h1>
          <p className="text-white/80 text-sm mt-1">ショート動画量産システム</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-pink-500" size={20} />
            <h2 className="text-xl font-bold text-gray-800">
              {isSignUp ? 'アカウント作成' : 'ログイン'}
            </h2>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="label-base">メールアドレス</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="input-base pl-10 focus:ring-pink-400"
                />
              </div>
            </div>

            <div>
              <label className="label-base">パスワード</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  minLength={6}
                  required
                  className="input-base pl-10 focus:ring-pink-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 text-base mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  処理中...
                </span>
              ) : (
                isSignUp ? 'アカウントを作成' : 'ログイン'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
            >
              {isSignUp
                ? 'すでにアカウントをお持ちの方はこちら'
                : 'アカウントをお持ちでない方はこちら'}
            </button>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          © 2024 ショート動画マネージャー
        </p>
      </div>
    </div>
  )
}
