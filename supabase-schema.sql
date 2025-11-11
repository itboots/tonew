-- Supabase 数据库表结构
-- 在 Supabase Dashboard -> SQL Editor 中执行此 SQL

-- 1. 用户配置表（扩展 auth.users）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  theme TEXT DEFAULT 'apple' CHECK (theme IN ('apple', 'cyberpunk')),
  auto_refresh BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 收藏表
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  description TEXT,
  category TEXT,
  importance INTEGER,
  tags TEXT[],
  notes TEXT,
  publish_date TIMESTAMP WITH TIME ZONE,
  favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- 3. 浏览历史表
CREATE TABLE IF NOT EXISTS public.history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  category TEXT,
  description TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为历史记录创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_history_user_visited ON public.history(user_id, visited_at DESC);

-- 4. 已删除内容表
CREATE TABLE IF NOT EXISTS public.dismissed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ========================================
-- Row Level Security (RLS) 策略
-- ========================================

-- 启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dismissed_items ENABLE ROW LEVEL SECURITY;

-- user_profiles 策略
CREATE POLICY "用户可以查看自己的配置"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的配置"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "用户可以更新自己的配置"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- favorites 策略
CREATE POLICY "用户可以查看自己的收藏"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加自己的收藏"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的收藏"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- history 策略
CREATE POLICY "用户可以查看自己的历史"
  ON public.history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加自己的历史"
  ON public.history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的历史"
  ON public.history FOR DELETE
  USING (auth.uid() = user_id);

-- dismissed_items 策略
CREATE POLICY "用户可以查看自己删除的内容"
  ON public.dismissed_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加删除记录"
  ON public.dismissed_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的删除记录"
  ON public.dismissed_items FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 自动更新 updated_at 触发器
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 自动创建用户配置触发器
-- ========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
