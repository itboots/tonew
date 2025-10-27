# YuCoder 赛博浏览器 🚀

一个赛博朋克风格的移动端热门内容聚合器，实时抓取 YuCoder API 的热门内容，并以炫酷的赛博朋克 UI 展示。

## ✨ 功能特性

- 🌐 **真实数据源** - 使用 YuCoder.cn 官方 API 获取热门内容
- 📱 **移动端优化** - 完美适配 320px-768px 移动设备
- 🎨 **赛博朋克 UI** - 霓虹发光效果、网格背景、未来科技感设计
- ⚡ **实时更新** - 一键刷新获取最新热门内容
- 🎯 **智能分类** - 自动分类技术、科技、社会等各类内容
- 🔄 **多平台聚合** - 整合 CSDN、知乎、掘金、微博等平台热门内容

## 🛠️ 技术栈

- **前端**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: Tailwind CSS + 自定义赛博朋克主题
- **API**: YuCoder.cn 热门内容 API
- **部署**: Vercel (Serverless Functions)

## 📊 数据源与分类

### 📈 技术编程类 (优先显示)
- **Java开发** - SpringBoot、Java框架、企业级开发
- **前端开发** - JavaScript、React、Vue、CSS技术
- **Python开发** - Django、Flask、数据科学
- **人工智能** - 机器学习、深度学习、AI框架
- **数据库** - MySQL、MongoDB、Redis等数据库技术
- **算法** - 数据结构、算法设计与优化
- **运维部署** - Linux、Docker、Kubernetes、云计算
- **后端开发** - 其他后端技术、框架和工具

### 🔬 前沿科技类
- **硬件科技** - 芯片、GPU、CPU、算力相关技术
- **新能源** - 电动车、电池技术、清洁能源
- **通信技术** - 5G、6G、网络通信技术

### 💼 职场发展类
- **职场求职** - 面试技巧、求职经验、职业规划
- **商业财经** - 创业投资、商业分析、经济趋势

### 🌍 社会热点类
- **政策规划** - 国家政策、发展规划、产业政策
- **教育话题** - 教育改革、学生话题、升学就业
- **社会热点** - 热门事件、社会现象、公众讨论

### 🎮 娱乐生活类
- **娱乐八卦** - 明星动态、综艺节目、娱乐新闻
- **游戏动漫** - 游戏资讯、动漫文化、二次元内容

### 📰 综合资讯类
- **综合资讯** - 其他未分类的热门内容

## 🎮 数据平台来源

当前整合以下平台的热门内容：

### 技术类平台
- **CSDN 热榜** - 最新技术文章和教程
- **掘金热榜** - 前端、后端、移动端技术分享
- **编程导航** - 编程社区热门讨论

### 综合类平台
- **知乎热榜** - 科技、社会、文化等热门讨论
- **微博热搜** - 实时热点话题
- **B站热门** - 科技、学习类视频
- **虎扑步行街** - 社区热门讨论
- **百度贴吧** - 各领域热门话题

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到 Vercel

### ⚠️ 重要：环境变量配置

**必须配置以下环境变量，否则应用无法正常工作：**

1. **获取 Upstash Redis 凭据**：
   - 访问 [Upstash Console](https://console.upstash.com/)
   - 创建一个新的 Redis 数据库（免费版即可）
   - 在数据库详情页面找到 REST API 部分
   - 复制 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

2. **在 Vercel 中配置环境变量**：
   - 进入项目 → Settings → Environment Variables
   - 添加以下变量：
     ```
     UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
     UPSTASH_REDIS_REST_TOKEN=your_token_here
     ```

### 方式一：通过 GitHub（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 [Vercel](https://vercel.com) 并登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. **配置环境变量**（见上方说明）
6. 点击 "Deploy"

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN

# 重新部署
vercel --prod
```

### 常见部署问题

#### 问题 1：页面显示空白或"数据为空"

**原因**：环境变量未配置或配置错误

**解决方案**：
1. 检查 Vercel 项目设置中的环境变量
2. 确保变量名完全匹配（区分大小写）
3. 验证 Redis URL 和 Token 是否正确
4. 重新部署项目

#### 问题 2：首次访问很慢

**原因**：Serverless 冷启动 + 首次数据获取

**解决方案**：
- 这是正常现象，后续访问会快很多
- 数据会缓存 15 分钟，提升性能

#### 问题 3：Redis 连接失败

**原因**：Redis 凭据不正确或网络问题

**解决方案**：
1. 在 Upstash Console 验证凭据
2. 确保 Redis 数据库处于活动状态
3. 检查 Vercel 部署日志中的错误信息

部署完成后，你将获得一个 `.vercel.app` 域名。

## 特性

- 🚀 快速爬取和展示内容（从 YuCoder API 获取热门内容）
- 🎨 赛博朋克风格 UI
- 📱 移动端优化
- ⚡ Serverless 架构
- 🔄 实时内容刷新
- 💾 Redis 缓存优化（15分钟缓存）
- 📊 多数据源聚合（知乎、微博、B站、掘金、CSDN等）
- 🔥 热度排序和智能评分

## 项目结构

```
├── app/              # Next.js App Router
├── components/       # React 组件
├── lib/             # 工具函数和服务
├── types/           # TypeScript 类型定义
└── public/          # 静态资源
```
