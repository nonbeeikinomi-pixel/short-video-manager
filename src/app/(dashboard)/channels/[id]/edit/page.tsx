import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChannelForm } from '@/components/channels/ChannelForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Channel } from '@/types'

export default async function EditChannelPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!channel) notFound()

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/channels/${params.id}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">チャンネル編集</h1>
          <p className="text-gray-500 text-xs">{channel.name}</p>
        </div>
      </div>

      <div className="card">
        <ChannelForm channel={channel as Channel} />
      </div>
    </div>
  )
}
