import type { Channel, Character } from '@/types'

export function buildIdeaPrompt(channel: Channel, character: Character | null, theme?: string): string {
  const requiredElements = character?.required_elements?.length
    ? `\n【必須要素】\n${character.required_elements.map(e => `・${e}`).join('\n')}`
    : ''

  const forbiddenElements = character?.forbidden_elements?.length
    ? `\n【NG表現】\n${character.forbidden_elements.map(e => `・${e}`).join('\n')}`
    : ''

  const aiDisclosure = character?.is_ai
    ? `\n【重要】このキャラクターはAIキャラクターです。必ず「AIキャラクター」であることが明示できる内容にしてください。\nAI明示テキスト例：「${character.ai_disclosure_text}」`
    : ''

  const themeInstruction = theme
    ? `\n【今回のテーマ】\n${theme}`
    : ''

  return `あなたはショート動画の企画・脚本専門のAIです。
以下のチャンネル情報に基づいて、魅力的な動画企画を1本分作成してください。

【チャンネル情報】
チャンネル名：${channel.name}
ジャンル：${channel.genre || '未設定'}
対象年齢：${channel.target_age || '未設定'}
${channel.description ? `説明：${channel.description}` : ''}

${character ? `【キャラクター情報】
キャラクター名：${character.name}
${character.personality ? `性格：${character.personality}` : ''}
${character.appearance ? `外見：${character.appearance}` : ''}
${character.voice_style ? `話し方：${character.voice_style}` : ''}
${character.description ? `説明：${character.description}` : ''}` : ''}
${requiredElements}
${forbiddenElements}
${aiDisclosure}
${themeInstruction}

【出力フォーマット】
以下のJSON形式で出力してください。JSONのみを出力し、前後に説明文は不要です：

{
  "title": "動画タイトル（25文字以内、視聴者が思わずクリックしたくなるもの）",
  "duration": "推奨動画尺（例：45秒）",
  "hook": "冒頭3秒のフック（視聴者を引き込む一文、インパクト重視）",
  "story": "ストーリーの流れ（各シーンを箇条書きで、具体的に）",
  "dialogue": "主要なセリフ（キャラクター名：セリフ の形式で複数行）",
  "narration": "ナレーション原稿（読み上げる文章形式で）",
  "telop": "テロップ一覧（画面に表示するテキスト、インパクトある言葉を）",
  "imagePrompt": "画像生成プロンプト（英語、Stable Diffusion/Midjourney向け、詳細に）",
  "videoPrompt": "動画生成プロンプト（英語、動きやシーンを具体的に）",
  "thumbnailText": "サムネイルに入れる文言（短く・インパクト・日本語）",
  "postText": "投稿文（SNS用、絵文字使用、改行あり、ハッシュタグなし）",
  "hashtags": ["ハッシュタグ1（#なし）", "ハッシュタグ2", "ハッシュタグ3（10個程度）"],
  "cta": "CTA文言（フォロー・コメント・保存を促す一文）"
}`
}

export function buildScriptPrompt(videoIdea: {
  title: string
  hook: string
  story: string
  dialogue: string
  duration: string
}, character: Character | null): string {
  return `以下の動画企画をもとに、詳細な台本を作成してください。

【動画タイトル】${videoIdea.title}
【動画尺】${videoIdea.duration}
【フック】${videoIdea.hook}
【ストーリー】${videoIdea.story}
【セリフ】${videoIdea.dialogue}
${character ? `【キャラクター】${character.name}` : ''}

以下のJSON形式で台本を出力してください：

{
  "scenes": [
    {
      "scene_number": 1,
      "time": "0:00-0:03",
      "description": "シーンの説明",
      "character_action": "キャラクターの動き・表情",
      "dialogue": "このシーンのセリフ",
      "narration": "ナレーション",
      "telop": "表示テロップ",
      "bgm_mood": "BGMの雰囲気（明るい/落ち着いた/テンション高め等）",
      "notes": "撮影・編集メモ"
    }
  ],
  "total_scenes": 数値,
  "estimated_duration": "推定尺",
  "production_notes": "制作上の注意点"
}`
}

export function buildAnalysisPrompt(analyticsData: {
  views: number
  likes: number
  comments: number
  saves: number
  shares: number
  follower_gain: number
  notes: string | null
  videoTitle: string
  channelName: string
}): string {
  const engagementRate = analyticsData.views > 0
    ? ((analyticsData.likes + analyticsData.comments + analyticsData.saves + analyticsData.shares) / analyticsData.views * 100).toFixed(2)
    : '0'

  return `以下の動画分析データをもとに、改善案と次の企画提案を日本語で出力してください。

【動画タイトル】${analyticsData.videoTitle}
【チャンネル】${analyticsData.channelName}

【パフォーマンスデータ】
- 再生数：${analyticsData.views.toLocaleString()}回
- いいね数：${analyticsData.likes.toLocaleString()}
- コメント数：${analyticsData.comments.toLocaleString()}
- 保存数：${analyticsData.saves.toLocaleString()}
- シェア数：${analyticsData.shares.toLocaleString()}
- フォロワー増加数：${analyticsData.follower_gain.toLocaleString()}
- エンゲージメント率：${engagementRate}%
${analyticsData.notes ? `\n【メモ】${analyticsData.notes}` : ''}

以下のJSON形式で分析結果を出力してください：

{
  "summary": "パフォーマンスの総評（2〜3文）",
  "good_reasons": ["伸びた理由1", "伸びた理由2", "伸びた理由3"],
  "bad_reasons": ["伸びなかった理由1", "伸びなかった理由2"],
  "next_ideas": ["次に作るべき企画1", "次に作るべき企画2", "次に作るべき企画3"],
  "improvements": ["改善案1", "改善案2", "改善案3"]
}`
}
