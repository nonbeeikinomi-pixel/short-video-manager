import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function parseHashtags(text: string): string[] {
  return text
    .split(/[\n,、]/)
    .map(t => t.trim().replace(/^#/, ''))
    .filter(Boolean)
}

export function formatHashtags(hashtags: string[]): string {
  return hashtags.map(h => `#${h}`).join(' ')
}

export const PLATFORMS = ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'X(Twitter)', 'Facebook']

export const COLOR_OPTIONS = [
  { value: 'pink', label: 'ピンク', color: '#ec4899' },
  { value: 'purple', label: 'パープル', color: '#8b5cf6' },
  { value: 'yellow', label: 'イエロー', color: '#eab308' },
  { value: 'navy', label: 'ネイビー', color: '#1e293b' },
  { value: 'gold', label: 'ゴールド', color: '#d97706' },
  { value: 'green', label: 'グリーン', color: '#10b981' },
  { value: 'red', label: 'レッド', color: '#ef4444' },
  { value: 'orange', label: 'オレンジ', color: '#f97316' },
  { value: 'teal', label: 'ティール', color: '#14b8a6' },
]

export const STATUS_LIST = [
  '企画中',
  '台本完成',
  '画像作成済み',
  '動画作成済み',
  '投稿予約済み',
  '投稿済み',
] as const
