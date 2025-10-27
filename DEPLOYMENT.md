# Vercel 部署指南

## 📋 部署前检查清单

### 1. 准备 Upstash Redis

- [ ] 访问 https://console.upstash.com/
- [ ] 创建账号并登录
- [ ] 创建新的 Redis 数据库（选择免费版）
- [ ] 复制 `UPSTASH_REDIS_REST_URL`
- [ ] 复制 `UPSTASH_REDIS_REST_TOKEN`

### 2. 配置 Vercel 环境变量

- [ ] 登录 Vercel Dashboard
- [ ] 进入项目 Settings → Environment Variables
- [ ] 添加 `UPSTASH_REDIS_REST_URL`
- [ ] 添加 `UPSTASH_REDIS_REST_TOKEN`
- [ ] 保存配置

### 3. 部署项目

- [ ] 推送代码到 GitHub
- [ ] 在 Vercel 导入项目
- [ ] 等待构建完成
- [ ] 访问部署的 URL 测试

## 🔧 环境变量配置

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `UPSTASH_REDIS_REST_URL` | ✅ 是 | Upstash Redis REST API URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ 是 | Upstash Redis REST API Token | `AXXXxxx...` |
| `TARGET_URL` | ❌ 否 | 目标网站 URL | `https://yucoder.cn` |
| `SCRAPE_TIMEOUT` | ❌ 否 | 超时时间（毫秒） | `10000` |

## 🐛 常见问题排查

### 问题：页面显示"数据为空"或空白

**可能原因**：
1. 环境变量未配置
2. Redis 连接失败
3. API 请求失败

**排查步骤**：

1. 检查 Vercel 环境变量是否正确配置
2. 查看 Vercel 部署日志（Functions 标签）
3. 测试 Redis 连接：
   ```bash
   curl -X GET "YOUR_REDIS_URL/get/test" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
4. 手动触发强制刷新：访问 `https://your-app.vercel.app/?refresh=true`

### 问题：首次访问很慢

**原因**：Serverless 冷启动 + 首次数据获取

**解决方案**：
- 正常现象，后续访问会快很多
- 可以配置 Vercel 的 Edge Functions 减少冷启动

### 问题：数据不更新

**原因**：缓存策略

**解决方案**：
1. 点击页面上的"强制刷新"按钮
2. 等待 1 分钟后自动更新
3. 手动清除 Redis 缓存

## 📊 监控和日志

### 查看部署日志

1. 进入 Vercel 项目
2. 点击 Deployments
3. 选择最新的部署
4. 查看 Build Logs 和 Function Logs

### 查看运行时日志

1. 进入 Vercel 项目
2. 点击 Functions 标签
3. 选择 `/api/scrape`
4. 查看实时日志

## 🚀 性能优化建议

1. **启用 Edge Caching**：已在 `vercel.json` 中配置
2. **Redis 缓存**：15 分钟 TTL，减少 API 调用
3. **分页加载**：避免一次加载过多数据
4. **CDN 加速**：Vercel 自动提供全球 CDN

## 🔄 更新部署

### 自动部署（推荐）

1. 推送代码到 GitHub
2. Vercel 自动触发部署
3. 等待构建完成

### 手动部署

```bash
vercel --prod
```

## 📝 部署后验证

- [ ] 访问首页，检查是否正常显示
- [ ] 点击"刷新"按钮，测试数据更新
- [ ] 检查分类筛选功能
- [ ] 测试移动端响应式布局
- [ ] 查看 Vercel 日志，确认无错误
