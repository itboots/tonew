# Supabase 部署指南

## 📋 前置准备

已完成 Supabase 集成，现在需要在 Supabase Dashboard 中创建数据库表并配置环境变量。

## 🗄️ 步骤 1: 创建数据库表

### 1.1 打开 Supabase SQL Editor

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：`alojqjngnlgllzgowmku`
3. 在左侧菜单点击 **SQL Editor**

### 1.2 执行数据库脚本

1. 点击 **New Query** 创建新查询
2. 打开项目根目录的 `supabase-schema.sql` 文件
3. 复制**全部内容**到 SQL Editor
4. 点击右下角 **Run** 按钮执行

✅ **成功标志：** 看到 "Success. No rows returned" 消息

### 1.3 验证表创建

在左侧菜单点击 **Table Editor**，确认以下表已创建：
- ✅ `user_profiles` - 用户配置表
- ✅ `favorites` - 收藏表
- ✅ `history` - 浏览历史表
- ✅ `dismissed_items` - 已滑掉内容表

## 🔧 步骤 2: 配置环境变量

### 2.1 本地开发环境

项目根目录的 `.env.local` 已配置完成：

```env
NEXT_PUBLIC_SUPABASE_URL="https://alojqjngnlgllzgowmku.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."
SUPABASE_SERVICE_ROLE_KEY="eyJh..."
```

### 2.2 Vercel 生产环境

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下 3 个环境变量：

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://alojqjngnlgllzgowmku.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb2pxam5nbmxnbGx6Z293bWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzgzNDgsImV4cCI6MjA3ODQ1NDM0OH0.JgLwuF8h6hee57K2FPdtqEh9qTtuKA9vFHc3YmrfdcA` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb2pxam5nbmxnbGx6Z293bWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg3ODM0OCwiZXhwIjoyMDc4NDU0MzQ4fQ.jTJVr2jLByrI6wI8fFZhbISG_k1k-IqpTz3YjOy7GeM` | Production, Preview, Development |

⚠️ **注意：** `NEXT_PUBLIC_` 前缀的变量会暴露到浏览器，`SERVICE_ROLE_KEY` 仅用于服务器端。

5. 点击 **Save** 保存所有变量
6. 触发重新部署：**Deployments** → 最新部署 → **Redeploy**

## 🧪 步骤 3: 测试集成

### 3.1 本地测试

```bash
# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 并测试以下功能：

1. **注册/登录**
   - [ ] 访问 `/auth/signin`
   - [ ] 注册新账号（输入邮箱、密码、用户名）
   - [ ] 登录已有账号

2. **用户中心**
   - [ ] 访问 `/profile`
   - [ ] 查看用户统计（收藏、历史、滑掉数量）
   - [ ] 切换主题（Apple / 赛博朋克）
   - [ ] 保存设置

3. **收藏功能**
   - [ ] 在首页收藏一条内容
   - [ ] 访问 `/favorites` 查看收藏列表
   - [ ] 取消收藏

4. **浏览历史**
   - [ ] 点击内容查看详情
   - [ ] 访问 `/history` 查看浏览历史
   - [ ] 删除单条历史
   - [ ] 清空所有历史

5. **退出登录**
   - [ ] 点击退出登录
   - [ ] 确认跳转到登录页

### 3.2 Supabase Dashboard 验证

1. 打开 **Table Editor**
2. 查看各表数据：
   - `user_profiles`: 确认用户配置已保存
   - `favorites`: 确认收藏记录已创建
   - `history`: 确认历史记录已记录
   - `dismissed_items`: 确认滑掉记录已保存

### 3.3 RLS（Row Level Security）验证

1. 尝试用不同账号登录
2. 确认只能看到自己的数据（收藏、历史等）
3. 确认无法访问其他用户的数据

## 🔒 安全检查清单

- [x] RLS 策略已启用（在 SQL 脚本中配置）
- [x] Service Role Key 仅用于服务器端 API
- [x] Anon Key 用于客户端操作
- [x] 所有用户数据通过 RLS 保护
- [x] 密码使用 Supabase Auth 加密存储

## 🎯 架构变更说明

### 迁移前（Redis）
- 认证：NextAuth + Redis Session
- 数据存储：Redis（临时，30 天过期）
- 用户数据：无持久化

### 迁移后（Supabase）
- 认证：Supabase Auth（JWT + Cookies）
- 数据存储：PostgreSQL（永久）
- 用户数据：完整持久化
- 安全性：Row Level Security

### Redis 保留用途
- 热门内容缓存（15 分钟 TTL）
- API 响应缓存
- 不再用于用户数据存储

## 📝 常见问题

### Q1: 执行 SQL 时报错 "relation already exists"
**A:** 表已存在，可以跳过或先删除表再重新创建：
```sql
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.history CASCADE;
DROP TABLE IF EXISTS public.dismissed_items CASCADE;
```

### Q2: 注册时报错 "Email rate limit exceeded"
**A:** Supabase 免费计划限制邮件发送，可以：
1. 在 Supabase Dashboard → Authentication → Settings
2. 关闭 "Enable email confirmations"
3. 或等待几分钟后重试

### Q3: 登录后显示 "Unauthorized"
**A:** 检查以下几点：
1. 环境变量是否正确配置
2. Supabase URL 和 Keys 是否匹配
3. 重启开发服务器：`npm run dev`

### Q4: Vercel 部署后无法登录
**A:** 确认：
1. Vercel 环境变量已正确配置
2. 重新部署项目
3. 清除浏览器缓存

## 🚀 下一步

集成完成后，你可以：
1. ✅ 开始使用真实的用户认证系统
2. ✅ 数据永久保存，不再丢失
3. ✅ 体验更快的查询性能
4. ✅ 使用 Supabase Realtime 功能（可选）
5. ✅ 通过 Supabase Dashboard 管理用户

---

🎉 **恭喜！** Supabase 集成已完成，现在拥有完整的用户体系和数据持久化！
