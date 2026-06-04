import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from '@google/generative-ai'

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new GeminiKeyMissingError()
  }
  return new GoogleGenerativeAI(apiKey)
}

export class GeminiKeyMissingError extends Error {
  constructor() {
    super('Gemini APIキーが設定されていません。環境変数 GEMINI_API_KEY を設定してください。')
    this.name = 'GeminiKeyMissingError'
  }
}

export function toJapaneseError(err: unknown): { message: string; status: number } {
  if (err instanceof GeminiKeyMissingError) {
    return { message: err.message, status: 500 }
  }

  if (err instanceof GoogleGenerativeAIFetchError) {
    if (err.status === 429) {
      return {
        message: 'Gemini APIの無料枠の利用制限に達しました。1分ほど待ってから再試行してください。',
        status: 429,
      }
    }
    if (err.status === 400) {
      return { message: 'リクエストの内容に問題があります。入力内容を確認してください。', status: 400 }
    }
    if (err.status === 403) {
      return { message: 'Gemini APIキーが無効です。正しいキーを設定してください。', status: 403 }
    }
    return { message: `Gemini API エラー（${err.status}）: ${err.message}`, status: err.status ?? 500 }
  }

  const message = err instanceof Error ? err.message : 'AI生成に失敗しました'
  // メッセージ内の 429 / quota 文字列でも検出
  if (message.includes('429') || /quota|resource.*exhausted/i.test(message)) {
    return {
      message: 'Gemini APIの無料枠の利用制限に達しました。1分ほど待ってから再試行してください。',
      status: 429,
    }
  }
  return { message, status: 500 }
}
