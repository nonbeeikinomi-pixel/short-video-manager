-- =============================================
-- ショート動画量産システム Supabase Schema
-- =============================================

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- テーブル作成
-- =============================================

-- channels: チャンネル管理
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  target_age TEXT,
  color_theme TEXT DEFAULT 'pink',
  icon TEXT DEFAULT '📺',
  style TEXT DEFAULT 'カラフル',
  platforms TEXT[] DEFAULT ARRAY['TikTok', 'YouTube Shorts', 'Instagram Reels'],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- characters: キャラクター設定
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  personality TEXT,
  appearance TEXT,
  voice_style TEXT,
  is_ai BOOLEAN DEFAULT false,
  ai_disclosure_text TEXT DEFAULT 'このキャラクターはAIが生成したフィクションのキャラクターです',
  image_prompt_template TEXT,
  post_template TEXT,
  required_elements TEXT[] DEFAULT ARRAY[]::TEXT[],
  forbidden_elements TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- video_ideas: 動画企画
CREATE TABLE IF NOT EXISTS video_ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  hook TEXT,
  story TEXT,
  dialogue TEXT,
  narration TEXT,
  telop TEXT,
  image_prompt TEXT,
  video_prompt TEXT,
  thumbnail_text TEXT,
  post_text TEXT,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  cta TEXT,
  status TEXT DEFAULT '企画中' CHECK (status IN ('企画中', '台本完成', '画像作成済み', '動画作成済み', '投稿予約済み', '投稿済み')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- scripts: 台本管理
CREATE TABLE IF NOT EXISTS scripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_idea_id UUID REFERENCES video_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- assets: 素材管理
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_idea_id UUID REFERENCES video_ideas(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'other' CHECK (asset_type IN ('image', 'video', 'audio', 'thumbnail', 'other')),
  file_size INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- post_schedule: 投稿スケジュール
CREATE TABLE IF NOT EXISTS post_schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_idea_id UUID REFERENCES video_ideas(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_date DATE NOT NULL,
  post_time TIME DEFAULT '18:00:00',
  platform TEXT NOT NULL DEFAULT 'TikTok',
  status TEXT DEFAULT '企画中' CHECK (status IN ('企画中', '台本完成', '画像作成済み', '動画作成済み', '投稿予約済み', '投稿済み')),
  title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- analytics: 分析データ
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_idea_id UUID REFERENCES video_ideas(id) ON DELETE CASCADE NOT NULL,
  post_schedule_id UUID REFERENCES post_schedule(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  follower_gain INTEGER DEFAULT 0,
  notes TEXT,
  ai_analysis JSONB DEFAULT NULL,
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- updated_at 自動更新トリガー
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER video_ideas_updated_at BEFORE UPDATE ON video_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER scripts_updated_at BEFORE UPDATE ON scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER post_schedule_updated_at BEFORE UPDATE ON post_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER analytics_updated_at BEFORE UPDATE ON analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- channels ポリシー
CREATE POLICY "channels_select" ON channels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "channels_insert" ON channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "channels_update" ON channels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "channels_delete" ON channels FOR DELETE USING (auth.uid() = user_id);

-- characters ポリシー
CREATE POLICY "characters_select" ON characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "characters_insert" ON characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "characters_update" ON characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "characters_delete" ON characters FOR DELETE USING (auth.uid() = user_id);

-- video_ideas ポリシー
CREATE POLICY "video_ideas_select" ON video_ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "video_ideas_insert" ON video_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "video_ideas_update" ON video_ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "video_ideas_delete" ON video_ideas FOR DELETE USING (auth.uid() = user_id);

-- scripts ポリシー
CREATE POLICY "scripts_select" ON scripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scripts_insert" ON scripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scripts_update" ON scripts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scripts_delete" ON scripts FOR DELETE USING (auth.uid() = user_id);

-- assets ポリシー
CREATE POLICY "assets_select" ON assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "assets_insert" ON assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assets_update" ON assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "assets_delete" ON assets FOR DELETE USING (auth.uid() = user_id);

-- post_schedule ポリシー
CREATE POLICY "post_schedule_select" ON post_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "post_schedule_insert" ON post_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_schedule_update" ON post_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "post_schedule_delete" ON post_schedule FOR DELETE USING (auth.uid() = user_id);

-- analytics ポリシー
CREATE POLICY "analytics_select" ON analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analytics_insert" ON analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analytics_update" ON analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "analytics_delete" ON analytics FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Supabase Storage バケット作成
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('oshirihime', 'oshirihime', false, 104857600, ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','audio/mpeg','audio/wav']),
  ('nonchan', 'nonchan', false, 104857600, ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','audio/mpeg','audio/wav']),
  ('thumbnail', 'thumbnail', false, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('video', 'video', false, 524288000, ARRAY['video/mp4','video/mov','video/avi']),
  ('audio', 'audio', false, 52428800, ARRAY['audio/mpeg','audio/wav','audio/m4a'])
ON CONFLICT (id) DO NOTHING;

-- Storageポリシー
CREATE POLICY "storage_select" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_update" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- インデックス
-- =============================================

CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_channel_id ON characters(channel_id);
CREATE INDEX IF NOT EXISTS idx_video_ideas_channel_id ON video_ideas(channel_id);
CREATE INDEX IF NOT EXISTS idx_video_ideas_user_id ON video_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_video_ideas_status ON video_ideas(status);
CREATE INDEX IF NOT EXISTS idx_post_schedule_user_id ON post_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_post_schedule_post_date ON post_schedule(post_date);
CREATE INDEX IF NOT EXISTS idx_analytics_video_idea_id ON analytics(video_idea_id);
