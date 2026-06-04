import { ChannelForm } from '@/components/channels/ChannelForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewChannelPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/channels" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">チャンネル追加</h1>
          <p className="text-gray-500 text-xs">新しいチャンネルを設定します</p>
        </div>
      </div>

      <div className="card">
        <ChannelForm />
      </div>
    </div>
  )
}
