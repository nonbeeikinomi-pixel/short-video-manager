# ショート動画量産システム

AIを活用したショート動画の企画・管理・量産Webアプリです。

## 機能

- **チャンネル管理**: 複数チャンネル（50チャンネル以上対応）の一元管理
- **キャラクター設定**: チャンネルごとにキャラクター・ルールを設定
- **AI企画生成**: OpenAI GPT-4oが動画企画を全自動生成
  - タイトル / 動画尺 / 冒頭フック / ストーリー / セリフ / ナレーション / テロップ / 画像生成プロンプト / 動画生成プロンプト / サムネイル文言 / 投稿文 / ハッシュタグ / CTA
- **投稿カレンダー**: 月別カレンダーで投稿スケジュール管理
- **分析管理**: 投稿実績の手入力 + AI改善提案
- **Discord通知**: 企画生成・ステータス変更・スケジュール登録を自動通知

## 対応チャンネル（初期設定例）

| チャンネル | 対象 | スタイル |
|---|---|---|
| おしりひめワールド | 3〜8歳 | カラフル・かわいい |
| AI日本酒女子「のんちゃん」 | 20歳以上 | 和風・上品 |

---

## セットアップ

### 1. リポジトリをクローン・依存関係インストール

```bash
git clone <repository-url>
cd short-video-manager
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーして設定します：

```bash
cp .env.example .env.local
```

`.env.local` を編集：

```env
# Supabase（必須）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI（AI企画生成に必須）
OPENAI_API_KEY=sk-your-openai-api-key

# Discord Webhook（任意）
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# アプリURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseセットアップ

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editorで `supabase/schema.sql` を実行
3. ダッシュボード → Settings → API でURLとキーを取得

### 4. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` でアクセス

---

## Netlifyデプロイ

### 1. ビルド設定

Netlifyダッシュボードで以下を設定：

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node.js version**: `20`

### 2. 環境変数をNetlifyに設定

Netlify → Site settings → Environment variables で上記の環境変数をすべて追加

### 3. プラグイン設定

`netlify.toml` の内容が自動的に適用されます。Netlify Next.jsプラグインは自動検出されます。

---

## チャンネル追加方法

1. サイドバーの「チャンネル」をクリック
2. 「新規追加」ボタンをクリック
3. 以下を設定：
   - チャンネル名・説明
   - ジャンル・対象年齢
   - アイコン・カラーテーマ
   - 投稿プラットフォーム
4. チャンネル詳細画面でキャラクター設定を追加
   - 性格・外見・話し方
   - 必須要素（動画に必ず含める要素）
   - NG要素（禁止する表現）
   - AIキャラクターの場合は明示テキスト設定

---

## 使い方マニュアル

### 企画生成の流れ

```
1. サイドバー「動画企画」→「新規生成」
2. チャンネルを選択
3. テーマ・方向性を入力（任意）
4. 「AIで企画を生成する」ボタンをクリック
5. 生成完了後、企画詳細ページに自動遷移
6. 各セクションを編集・コピー
7. ステータスを更新して進捗管理
8. 投稿予定を登録してカレンダーに反映
```

### 投稿スケジュール管理

```
1. カレンダーページで日付をクリック
2. 投稿情報（日時・プラットフォーム）を設定
3. ステータスを随時更新
4. Discord通知で自動お知らせ
```

### 分析・改善

```
1. 投稿後に分析ページでデータ入力
   - 再生数・いいね・コメント・保存・シェア・フォロワー増加
2. 「AI分析を実行」で改善提案を取得
3. 次の企画に活かす
```

---

## 技術構成

| 技術 | 用途 |
|---|---|
| Next.js 14 (App Router) | フロントエンド・API Routes |
| Tailwind CSS | スタイリング |
| Supabase | 認証・データベース・ストレージ |
| OpenAI GPT-4o | AI企画生成・分析 |
| Netlify | ホスティング・デプロイ |
| Discord Webhook | 通知 |

---

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Supabaseサービスロールキー |
| `OPENAI_API_KEY` | ✅ | OpenAI APIキー |
| `DISCORD_WEBHOOK_URL` | 任意 | Discord WebhookURL |
| `NEXT_PUBLIC_APP_URL` | ✅ | アプリのURL |

---

## ライセンス

Private - All Rights Reserved
