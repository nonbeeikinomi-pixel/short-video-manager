interface DiscordEmbed {
  title: string
  description?: string
  color?: number
  fields?: Array<{ name: string; value: string; inline?: boolean }>
  footer?: { text: string }
  timestamp?: string
}

interface DiscordMessage {
  content?: string
  embeds?: DiscordEmbed[]
  username?: string
  avatar_url?: string
}

const CHANNEL_COLORS: Record<string, number> = {
  pink: 0xec4899,
  purple: 0x8b5cf6,
  yellow: 0xeab308,
  navy: 0x1e293b,
  gold: 0xd97706,
  green: 0x10b981,
  red: 0xef4444,
  orange: 0xf97316,
  teal: 0x14b8a6,
}

export async function sendDiscordNotification(payload: DiscordMessage): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return false

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function notifyNewIdea(params: {
  channelName: string
  channelIcon: string
  colorTheme: string
  title: string
  duration: string
  hook: string
  status: string
  appUrl: string
  ideaId: string
}) {
  const color = CHANNEL_COLORS[params.colorTheme] || 0xec4899

  return sendDiscordNotification({
    username: 'ショート動画マネージャー',
    embeds: [
      {
        title: `${params.channelIcon} 新しい動画企画が生成されました！`,
        description: `**${params.channelName}** のチャンネル向けに新しい企画が作成されました。`,
        color,
        fields: [
          { name: 'タイトル', value: params.title, inline: false },
          { name: '動画尺', value: params.duration, inline: true },
          { name: 'ステータス', value: params.status, inline: true },
          { name: 'フック', value: params.hook, inline: false },
        ],
        footer: { text: `ショート動画量産システム | ${params.channelName}` },
        timestamp: new Date().toISOString(),
      },
    ],
  })
}

export async function notifyStatusChange(params: {
  channelName: string
  channelIcon: string
  colorTheme: string
  title: string
  oldStatus: string
  newStatus: string
}) {
  const color = CHANNEL_COLORS[params.colorTheme] || 0xec4899

  return sendDiscordNotification({
    username: 'ショート動画マネージャー',
    embeds: [
      {
        title: `${params.channelIcon} ステータスが更新されました`,
        color,
        fields: [
          { name: 'チャンネル', value: params.channelName, inline: true },
          { name: 'タイトル', value: params.title, inline: false },
          { name: '変更前', value: params.oldStatus, inline: true },
          { name: '変更後', value: params.newStatus, inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  })
}

export async function notifyScheduled(params: {
  channelName: string
  channelIcon: string
  colorTheme: string
  title: string
  postDate: string
  platform: string
}) {
  const color = CHANNEL_COLORS[params.colorTheme] || 0xec4899

  return sendDiscordNotification({
    username: 'ショート動画マネージャー',
    embeds: [
      {
        title: `${params.channelIcon} 投稿スケジュールが登録されました`,
        color,
        fields: [
          { name: 'チャンネル', value: params.channelName, inline: true },
          { name: 'タイトル', value: params.title, inline: false },
          { name: '投稿日', value: params.postDate, inline: true },
          { name: 'プラットフォーム', value: params.platform, inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  })
}
