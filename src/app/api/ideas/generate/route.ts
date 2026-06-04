import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { createGeminiClient, toJapaneseError } from '@/lib/gemini/client'
import { buildIdeaPrompt } from '@/lib/openai/prompts'
import { notifyNewIdea } from '@/lib/discord/webhook'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const { channelId, theme } = await request.json()
    if (!channelId) return NextResponse.json({ error: 'channelIdは必須です' }, { status: 400 })

    // チャンネル取得
    const { data: channel } = await supabase
      .from('channels').select('*').eq('id', channelId).eq('user_id', user.id).single()
    if (!channel) return NextResponse.json({ error: 'チャンネルが見つかりません' }, { status: 404 })

    // キャラクター取得（最初の1件）
    const { data: characters } = await supabase
      .from('characters').select('*').eq('channel_id', channelId).limit(1)
    const character = characters?.[0] || null

    const genAI = createGeminiClient()
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    })

    const prompt = buildIdeaPrompt(channel, character, theme)
    const result = await model.generateContent(prompt)
    const content = result.response.text()
    if (!content) throw new Error('AIからの応答が空です')

    const generated = JSON.parse(content)

    // Supabaseに保存
    const { data: idea, error: insertError } = await supabase.from('video_ideas').insert({
      channel_id: channelId,
      user_id: user.id,
      title: generated.title || '無題',
      duration: generated.duration,
      hook: generated.hook,
      story: generated.story,
      dialogue: generated.dialogue,
      narration: generated.narration,
      telop: generated.telop,
      image_prompt: generated.imagePrompt,
      video_prompt: generated.videoPrompt,
      thumbnail_text: generated.thumbnailText,
      post_text: generated.postText,
      hashtags: Array.isArray(generated.hashtags) ? generated.hashtags : [],
      cta: generated.cta,
      status: '企画中',
    }).select().single()

    if (insertError) throw insertError

    // Discord通知
    await notifyNewIdea({
      channelName: channel.name,
      channelIcon: channel.icon,
      colorTheme: channel.color_theme,
      title: generated.title,
      duration: generated.duration || '未設定',
      hook: generated.hook || '',
      status: '企画中',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
      ideaId: idea.id,
    })

    return NextResponse.json({ idea, generated })
  } catch (err: unknown) {
    console.error('AI生成エラー:', err)
    const { message, status } = toJapaneseError(err)
    return NextResponse.json({ error: message }, { status })
  }
}
