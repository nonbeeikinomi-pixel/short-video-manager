import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { notifyStatusChange } from '@/lib/discord/webhook'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const body = await request.json()

    // 既存データ取得（ステータス変更通知のため）
    const { data: existing } = await supabase
      .from('video_ideas')
      .select('*, channels(name, icon, color_theme)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    const { data, error } = await supabase
      .from('video_ideas')
      .update(body)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    // ステータス変更時にDiscord通知
    if (body.status && body.status !== existing.status) {
      await notifyStatusChange({
        channelName: existing.channels?.name || '',
        channelIcon: existing.channels?.icon || '📺',
        colorTheme: existing.channels?.color_theme || 'pink',
        title: existing.title,
        oldStatus: existing.status,
        newStatus: body.status,
      })
    }

    return NextResponse.json({ data })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'エラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const { error } = await supabase
      .from('video_ideas')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'エラーが発生しました' },
      { status: 500 }
    )
  }
}
