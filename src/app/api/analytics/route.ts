import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { createGeminiClient, toJapaneseError } from '@/lib/gemini/client'
import { buildAnalysisPrompt } from '@/lib/openai/prompts'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

    const body = await request.json()
    const { videoIdeaId, views, likes, comments, saves, shares, follower_gain, notes, generateAiAnalysis } = body

    // 動画企画取得
    const { data: idea } = await supabase
      .from('video_ideas')
      .select('title, channels(name)')
      .eq('id', videoIdeaId)
      .eq('user_id', user.id)
      .single()

    let aiAnalysis = null

    if (generateAiAnalysis && idea) {
      const genAI = createGeminiClient()
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      })

      const prompt = buildAnalysisPrompt({
        views, likes, comments, saves, shares, follower_gain, notes,
        videoTitle: idea.title,
        channelName: ((idea.channels as unknown) as { name: string } | null)?.name || '',
      })

      const result = await model.generateContent(prompt)
      const content = result.response.text()
      if (content) aiAnalysis = JSON.parse(content)
    }

    const { data, error } = await supabase.from('analytics').upsert({
      video_idea_id: videoIdeaId,
      user_id: user.id,
      views, likes, comments, saves, shares, follower_gain, notes,
      ai_analysis: aiAnalysis,
      recorded_at: new Date().toISOString().split('T')[0],
    }, { onConflict: 'video_idea_id,recorded_at' }).select().single()

    if (error) throw error
    return NextResponse.json({ data, aiAnalysis })
  } catch (err: unknown) {
    console.error('分析エラー:', err)
    const { message, status } = toJapaneseError(err)
    return NextResponse.json({ error: message }, { status })
  }
}
