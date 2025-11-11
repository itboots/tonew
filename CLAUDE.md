# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

一个赛博朋克风格的移动端热门内容聚合器，从 YuCoder API 抓取多平台热门内容（知乎、微博、CSDN、掘金、B站等），并提供分类过滤、热度排序、滑动删除等功能。

## Architecture

### Core Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk animations
- **Caching**: Upstash Redis (15-minute TTL)
- **Data Source**: YuCoder API (`https://api.yucoder.cn/api/hot/list`)
- **Deployment**: Vercel with serverless functions

### Key Data Flow

1. **Content Fetching** (`lib/scraper.ts`):
   - Fetches from YuCoder API via POST request
   - Parses multi-platform data (8+ sources)
   - Assigns categories based on content type and keywords
   - Calculates importance scores for default sorting
   - Preserves `hotness` (followerCount) for category-filtered sorting

2. **Caching Strategy** (`lib/redis.ts`):
   - **Default mode**: 15-minute Redis cache, auto-refresh every 1 minute
   - **Force refresh**: Bypasses cache, fetches fresh data
   - **Category filter mode**: Bypasses cache, sorts by hotness instead of importance
   - Stores dismissed item IDs in Redis set (`dismissed_items`)

3. **API Routes** (`app/api/scrape/route.ts`):
   - `?refresh=true`: Force refresh from API
   - `?category=分类名`: Category filter (bypasses cache, sorts by hotness)
   - `?page=N&pageSize=M`: Pagination support
   - Filters out dismissed items before returning data

4. **Category System**:
   - **技术编程类**: Java开发, 前端开发, Python开发, 人工智能, 数据库, 算法, 运维部署, 后端开发
   - **前沿科技类**: 硬件科技, 新能源, 通信技术
   - **职场发展类**: 职场求职, 商业财经
   - **社会热点类**: 政策规划, 教育话题, 社会热点
   - **娱乐生活类**: 娱乐八卦, 游戏动漫
   - **综合资讯类**: 综合资讯 (fallback)

### Critical Implementation Details

- **Sorting behavior**: Default mode sorts by `importance` (calculated score), category filter mode sorts by `hotness` (followerCount)
- **ID generation**: Uses complex hash with timestamp and random suffix to ensure uniqueness across multi-source data
- **Redis fallback**: If Redis is unavailable, fetches data directly but with degraded performance
- **Dismissed items**: Persisted in Redis set, filtered at API level before pagination

## Development Commands

```bash
# Install dependencies
npm install

# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

**Note**: No TypeScript type-check script configured. Add `"type-check": "tsc --noEmit"` to package.json if needed.

## Environment Configuration

### Required Environment Variables (Vercel)

**MUST be configured for production deployment:**

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Setup steps:**
1. Create free Redis database at [console.upstash.com](https://console.upstash.com/)
2. Copy REST API credentials from database details page
3. Add to Vercel → Project Settings → Environment Variables

**Fallback variable names** (checked in order):
- `UPSTASH_REDIS_REST_URL` → `UPSTASH_REDIS_URL` → `REDIS_URL`
- `UPSTASH_REDIS_REST_TOKEN` → `UPSTASH_REDIS_TOKEN` → `REDIS_TOKEN`

### Local Development

For local development, create `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

## Key Architecture Patterns

### Data Fetching Modes

The scraper has three distinct modes with different behaviors:

1. **Default Mode** (no params): Returns cached data with importance sorting
2. **Force Refresh** (`?refresh=true`): Fetches fresh data, updates cache
3. **Category Filter** (`?category=分类名`): Bypasses cache, sorts by hotness

**Why category mode bypasses cache**: Ensures latest data and correct hotness-based sorting without cache staleness.

### Category Mapping Logic

Categories are assigned in `lib/scraper.ts` via `mapCategoryToCyberStyle()`:
- Uses keyword matching on title + source type
- Priority-based matching (Java keywords checked before generic "后端开发")
- Fallback to "综合资讯" if no matches

**When modifying categories:**
1. Update `mapCategoryToCyberStyle()` keyword rules
2. Test with diverse content from multiple sources
3. Consider priority order to avoid misclassification

### Swipe-to-Dismiss Implementation

Client-side dismissal flow:
1. User swipes → `ContentCard.tsx` detects gesture
2. Local state update (immediate UI removal)
3. API call to `/api/dismiss-item` with item ID
4. Server stores ID in Redis set (`dismissed_items`)
5. Future API calls filter out dismissed IDs at server level

**Browser back button handling**: `popstate` event listener refetches data to show dismissed items again.

## Common Development Tasks

### Adding a New Category

1. Add category name to type definitions if needed
2. Update `mapCategoryToCyberStyle()` in `lib/scraper.ts`:
   ```typescript
   if (title.includes('新关键词') || description.includes('新关键词')) {
     return '新分类名';
   }
   ```
3. Add to category list in `CategoryFilter.tsx` if UI filter needed

### Modifying Cache TTL

Redis cache duration is controlled by constants in `lib/redis.ts`:
```typescript
const REDIS_CACHE_TTL = 900; // 15 minutes
const AUTO_UPDATE_INTERVAL = 60000; // 1 minute check
```

**Important**: Changing TTL requires redeploying for serverless functions to pick up new values.

### Debugging API Issues

Check Vercel Function Logs for these key indicators:
- `🔄 API 请求`: Shows request params (refresh, page, category)
- `✅ 过滤后剩余 X / Y 条`: Dismissed item filter results
- `⚠️ Redis客户端未初始化`: Environment variables not configured
- `API响应成功，开始处理数据`: YuCoder API call succeeded

## UI Component Architecture

### Cyberpunk Design System

Key visual components:
- `HologramHUD`: Animated background grid with neon accents
- `HologramPanel`: Container with glowing borders and blur effects
- `CyberButton`: Neon-styled buttons with hover animations
- `DataStream`: Animated data stream visualization

**Styling approach**: Extensive Tailwind utilities with custom animations in `app/globals.css`

### Client-Side State Management

**No external state library used.** State managed via:
- React `useState` for UI interactions (expansion, loading)
- `useEffect` for data fetching and browser event listeners
- Intersection Observer API for infinite scroll pagination

### Real-time Updates

Three update triggers:
1. **Auto-refresh**: Every 30 seconds via `setInterval`
2. **Visibility change**: `visibilitychange` event listener
3. **Navigation**: `popstate` event for back button
4. **Manual refresh**: User-triggered force refresh button