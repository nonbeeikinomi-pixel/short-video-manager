import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { notifyScheduled } from '@/lib/discord/webhook'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const body = await request.json()
    const { channelId, videoIdeaId, postDate, postTime, platform, title, notes, status } = body

    const { data: channel } = await supabase
      .from('channels').select('name, icon, color_theme').eq('id', channelId).single()

    const { data, error } = await supabase.from('post_schedule').insert({
      channel_id: channelId,
      video_idea_id: videoIdeaId || null,
      user_id: user.id,
      post_date: postDate,
      post_time: postTime || null,
      platform: platform || 'TikTok',
      title: title || null,
      notes: notes || null,
      status: status || '企画中',
    }).select().single()

    if (error) throw error

    if (channel) {
      await notifyScheduled({
        channelName: channel.name,
        channelIcon: channel.icon,
        colorTheme: channel.color_theme,
        title: title || '未タイトル',
        postDate,
        platform: platform || 'TikTok',
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const { id, ...body } = await request.json()

    const { data, error } = await supabase
      .from('post_schedule')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'エラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const { id } = await request.json()
    const { error } = await supabase.from('post_schedule').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'エラーが発生しました' },
      { status: 500 }
    )
  }
}
