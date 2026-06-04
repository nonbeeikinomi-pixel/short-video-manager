export type ColorTheme = 'pink' | 'purple' | 'yellow' | 'navy' | 'gold' | 'green' | 'red' | 'orange' | 'teal'

export type VideoStatus = '企画中' | '台本完成' | '画像作成済み' | '動画作成済み' | '投稿予約済み' | '投稿済み'

export type AssetType = 'image' | 'video' | 'audio' | 'thumbnail' | 'other'

export interface Channel {
  id: string
  user_id: string
  name: string
  description: string | null
  genre: string | null
  target_age: string | null
  color_theme: ColorTheme
  icon: string
  style: string
  platforms: string[]
  is_active: boolean
  sort_order: number
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  channel_id: string
  user_id: string
  name: string
  description: string | null
  personality: string | null
  appearance: string | null
  voice_style: string | null
  is_ai: boolean
  ai_disclosure_text: string | null
  image_prompt_template: string | null
  post_template: string | null
  required_elements: string[]
  forbidden_elements: string[]
  video_rules: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface VideoIdea {
  id: string
  channel_id: string
  user_id: string
  title: string
  duration: string | null
  hook: string | null
  story: string | null
  dialogue: string | null
  narration: string | null
  telop: string | null
  image_prompt: string | null
  video_prompt: string | null
  thumbnail_text: string | null
  post_text: string | null
  hashtags: string[]
  cta: string | null
  status: VideoStatus
  notes: string | null
  created_at: string
  updated_at: string
  channels?: Channel
}

export interface Script {
  id: string
  video_idea_id: string
  user_id: string
  content: Record<string, unknown>
  version: number
  is_final: boolean
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  video_idea_id: string | null
  channel_id: string
  user_id: string
  file_name: string
  file_path: string
  file_type: string
  asset_type: AssetType
  file_size: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface PostSchedule {
  id: string
  video_idea_id: string | null
  channel_id: string
  user_id: string
  post_date: string
  post_time: string | null
  platform: string
  status: VideoStatus
  title: string | null
  notes: string | null
  created_at: string
  updated_at: string
  channels?: Channel
  video_ideas?: VideoIdea
}

export interface Analytics {
  id: string
  video_idea_id: string
  post_schedule_id: string | null
  user_id: string
  views: number
  likes: number
  comments: number
  saves: number
  shares: number
  follower_gain: number
  notes: string | null
  ai_analysis: AiAnalysis | null
  recorded_at: string
  created_at: string
  updated_at: string
  video_ideas?: VideoIdea
}

export interface AiAnalysis {
  good_reasons: string[]
  bad_reasons: string[]
  next_ideas: string[]
  improvements: string[]
  summary: string
}

export interface GeneratedIdea {
  title: string
  duration: string
  hook: string
  story: string
  dialogue: string
  narration: string
  telop: string
  imagePrompt: string
  videoPrompt: string
  thumbnailText: string
  postText: string
  hashtags: string[]
  cta: string
}

export const STATUS_COLORS: Record<VideoStatus, string> = {
  '企画中': 'bg-gray-100 text-gray-700',
  '台本完成': 'bg-blue-100 text-blue-700',
  '画像作成済み': 'bg-purple-100 text-purple-700',
  '動画作成済み': 'bg-yellow-100 text-yellow-700',
  '投稿予約済み': 'bg-orange-100 text-orange-700',
  '投稿済み': 'bg-green-100 text-green-700',
}

export const COLOR_THEME_MAP: Record<ColorTheme, {
  gradient: string
  button: string
  badge: string
  border: string
  text: string
  light: string
}> = {
  pink: {
    gradient: 'from-pink-400 via-purple-400 to-pink-300',
    button: 'bg-pink-500 hover:bg-pink-600 text-white',
    badge: 'bg-pink-100 text-pink-700',
    border: 'border-pink-300',
    text: 'text-pink-600',
    light: 'bg-pink-50',
  },
  purple: {
    gradient: 'from-purple-500 via-violet-400 to-purple-300',
    button: 'bg-purple-500 hover:bg-purple-600 text-white',
    badge: 'bg-purple-100 text-purple-700',
    border: 'border-purple-300',
    text: 'text-purple-600',
    light: 'bg-purple-50',
  },
  yellow: {
    gradient: 'from-yellow-400 via-amber-300 to-yellow-200',
    button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    badge: 'bg-yellow-100 text-yellow-700',
    border: 'border-yellow-300',
    text: 'text-yellow-600',
    light: 'bg-yellow-50',
  },
  navy: {
    gradient: 'from-slate-800 via-slate-700 to-slate-600',
    button: 'bg-slate-700 hover:bg-slate-800 text-white',
    badge: 'bg-slate-100 text-slate-700',
    border: 'border-slate-400',
    text: 'text-slate-700',
    light: 'bg-slate-50',
  },
  gold: {
    gradient: 'from-amber-600 via-yellow-500 to-amber-400',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    badge: 'bg-amber-100 text-amber-800',
    border: 'border-amber-400',
    text: 'text-amber-700',
    light: 'bg-amber-50',
  },
  green: {
    gradient: 'from-green-500 via-emerald-400 to-green-300',
    button: 'bg-green-500 hover:bg-green-600 text-white',
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-300',
    text: 'text-green-600',
    light: 'bg-green-50',
  },
  red: {
    gradient: 'from-red-500 via-rose-400 to-red-300',
    button: 'bg-red-500 hover:bg-red-600 text-white',
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-300',
    text: 'text-red-600',
    light: 'bg-red-50',
  },
  orange: {
    gradient: 'from-orange-500 via-amber-400 to-orange-300',
    button: 'bg-orange-500 hover:bg-orange-600 text-white',
    badge: 'bg-orange-100 text-orange-700',
    border: 'border-orange-300',
    text: 'text-orange-600',
    light: 'bg-orange-50',
  },
  teal: {
    gradient: 'from-teal-500 via-cyan-400 to-teal-300',
    button: 'bg-teal-500 hover:bg-teal-600 text-white',
    badge: 'bg-teal-100 text-teal-700',
    border: 'border-teal-300',
    text: 'text-teal-600',
    light: 'bg-teal-50',
  },
}
