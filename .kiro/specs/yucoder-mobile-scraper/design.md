# 设计文档

## 概述

本项目是一个部署在 Vercel 上的全栈移动端网页应用，使用 Next.js 框架构建。应用通过 API 路由实现服务端爬取，前端采用 React 和 Tailwind CSS 打造赛博朋克风格的响应式界面。

### 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI库**: React 18
- **样式**: Tailwind CSS + 自定义赛博风格组件
- **爬取**: Cheerio (轻量级HTML解析)
- **HTTP客户端**: Fetch API / Axios
- **部署**: Vercel (Serverless Functions)
- **类型安全**: TypeScript

## 架构

### 系统架构图

```mermaid
graph TB
    User[用户浏览器] --> NextApp[Next.js App]
    NextApp --> HomePage[主页组件]
    HomePage --> APIRoute[/api/scrape]
    APIRoute --> Scraper[爬取服务]
    Scraper --> Target[yucoder.cn]
    Scraper --> Parser[内容解析器]
    Parser --> Filter[价值筛选器]
    Filter --> APIRoute
    APIRoute --> HomePage
    HomePage --> CyberUI[赛博UI组件]
```

### 部署架构

- **Vercel Edge Network**: 全球CDN分发静态资源
- **Serverless Functions**: API路由在请求时执行爬取逻辑
- **客户端渲染**: React组件在浏览器端渲染动态内容

## 组件和接口

### 前端组件

#### 1. HomePage (`app/page.tsx`)
主页面组件，协调整个应用流程

```typescript
interface HomePageProps {}

interface ContentState {
  items: ValueItem[];
  loading: boolean;
  error: string | null;
}
```

#### 2. ContentList (`components/ContentList.tsx`)
内容列表展示组件

```typescript
interface ContentListProps {
  items: ValueItem[];
}
```

#### 3. ContentCard (`components/ContentCard.tsx`)
单个内容卡片，赛博风格

```typescript
interface ContentCardProps {
  item: ValueItem;
}
```

#### 4. LoadingSpinner (`components/LoadingSpinner.tsx`)
加载动画，赛博风格

```typescript
interface LoadingSpinnerProps {
  message?: string;
}
```

#### 5. CyberButton (`components/CyberButton.tsx`)
赛博风格按钮组件

```typescript
interface CyberButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  loading?: boolean;
}
```

### 后端API

#### API路由: `/api/scrape`

**请求**:
```typescript
// GET /api/scrape
// 无需参数
```

**响应**:
```typescript
interface ScrapeResponse {
  success: boolean;
  data?: ValueItem[];
  error?: string;
  timestamp: string;
}
```

### 核心服务

#### ScraperService (`lib/scraper.ts`)

```typescript
class ScraperService {
  async scrapeWebsite(url: string): Promise<string>;
  async parseContent(html: string): Promise<RawItem[]>;
  async filterValueItems(items: RawItem[]): Promise<ValueItem[]>;
}
```

#### ContentParser (`lib/parser.ts`)

```typescript
interface ParserConfig {
  selectors: {
    container: string;
    title: string;
    link: string;
    description: string;
    date: string;
  };
}

class ContentParser {
  parse(html: string, config: ParserConfig): RawItem[];
}
```

## 数据模型

### ValueItem (有价值条目)

```typescript
interface ValueItem {
  id: string;              // 唯一标识
  title: string;           // 标题
  link: string;            // 链接URL
  description: string;     // 描述内容
  publishDate?: string;    // 发布时间
  category?: string;       // 分类
  importance: number;      // 重要性评分 (1-10)
  scrapedAt: string;       // 爬取时间戳
}
```

### RawItem (原始条目)

```typescript
interface RawItem {
  title: string;
  link: string;
  description: string;
  date?: string;
  rawHtml?: string;
}
```

## 赛博朋克UI设计

### 配色方案

```css
:root {
  --cyber-primary: #00f0ff;      /* 青色霓虹 */
  --cyber-secondary: #ff00ff;    /* 品红霓虹 */
  --cyber-accent: #7b2cbf;       /* 紫色 */
  --cyber-bg-dark: #0a0e27;      /* 深色背景 */
  --cyber-bg-card: #1a1f3a;      /* 卡片背景 */
  --cyber-text: #e0e0e0;         /* 文本颜色 */
  --cyber-glow: 0 0 10px currentColor;
}
```

### 视觉效果

1. **发光效果**: 使用 `box-shadow` 和 `text-shadow` 实现霓虹发光
2. **网格背景**: CSS渐变创建科技感网格
3. **动画**: 使用 Framer Motion 或 CSS animations
4. **字体**: 使用 'Orbitron' 或 'Rajdhani' 等科技感字体
5. **边框**: 斜角边框和渐变边框效果

### 响应式设计

- **移动优先**: 基础样式针对320px宽度
- **断点**:
  - sm: 640px
  - md: 768px
- **触摸优化**: 按钮最小44x44px点击区域

## 爬取策略

### 爬取流程

1. **发起请求**: 使用 User-Agent 模拟浏览器
2. **获取HTML**: 通过 fetch 获取页面内容
3. **解析DOM**: 使用 Cheerio 解析HTML结构
4. **提取数据**: 根据选择器提取目标信息
5. **数据清洗**: 移除HTML标签、规范化文本
6. **价值评估**: 根据规则评分和筛选
7. **返回结果**: 格式化为 ValueItem 数组

### 价值筛选规则

```typescript
interface FilterRules {
  minTitleLength: number;        // 最小标题长度
  minDescriptionLength: number;  // 最小描述长度
  requireLink: boolean;          // 必须包含链接
  excludeKeywords: string[];     // 排除关键词
  priorityKeywords: string[];    // 优先关键词
}
```

### 性能优化

- **超时控制**: 爬取请求5秒超时
- **并发限制**: 单次请求避免过多并发
- **缓存策略**: 考虑短期缓存（可选）
- **错误重试**: 失败时最多重试1次

## 错误处理

### 错误类型

```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INVALID_DATA = 'INVALID_DATA',
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}
```

### 错误处理策略

1. **网络错误**: 显示重试按钮和友好提示
2. **解析错误**: 记录错误，返回空数组
3. **超时错误**: 提示用户网络较慢，建议重试
4. **无效数据**: 过滤掉无效项，继续处理有效数据

### 用户反馈

- 加载状态: 显示动画和进度文本
- 成功状态: 平滑过渡显示内容
- 错误状态: 赛博风格的错误提示框
- 空数据: 显示"未找到内容"的占位符

## 测试策略

### 单元测试

- **ContentParser**: 测试HTML解析准确性
- **FilterRules**: 测试筛选逻辑
- **组件**: 测试UI组件渲染和交互

### 集成测试

- **API路由**: 测试完整的爬取流程
- **端到端**: 测试用户从访问到查看内容的完整流程

### 测试工具

- Jest: 单元测试框架
- React Testing Library: 组件测试
- MSW (Mock Service Worker): API模拟

## 部署配置

### Vercel配置 (`vercel.json`)

```json
{
  "functions": {
    "app/api/scrape/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 环境变量

```
TARGET_URL=https://yucoder.cn/index
SCRAPE_TIMEOUT=5000
```

## 安全考虑

1. **速率限制**: 避免过于频繁的爬取请求
2. **User-Agent**: 使用合理的User-Agent标识
3. **错误信息**: 不暴露敏感的系统信息
4. **CORS**: 正确配置跨域策略
5. **输入验证**: 验证和清理所有外部数据

## 未来扩展

- 添加内容搜索和过滤功能
- 支持多个数据源
- 实现内容收藏功能
- 添加PWA支持实现离线访问
- 数据持久化（数据库存储）
