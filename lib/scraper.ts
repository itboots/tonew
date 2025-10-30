import { ValueItem, ErrorType } from '@/types';
import { getDemoData } from './demo-data';

export class ScraperService {
  private timeout: number;

  constructor(timeout: number = 10000) {
    this.timeout = timeout;
  }

  
  async scrapeAndProcess(_forceRefresh: boolean = false, category?: string): Promise<ValueItem[]> {
    const startTime = Date.now();

    try {
      // 对于分类过滤，直接获取新数据并绕过缓存以确保最新和按热度排序
      if (category) {
        console.log('🔍 分类过滤模式：直接从API获取最新数据并按热度排序');
        const freshData = await this.fetchFromYuCoderAPI();

        console.log(`🔍 过滤分类: ${category}`);
        const filteredData = freshData.filter(item => item.category === category);
        console.log(`✅ 过滤后剩余 ${filteredData.length} / ${freshData.length} 条`);

        // 按热度排序而不是重要性
        const sortedByHotness = filteredData.sort((a, b) => (b.hotness || 0) - (a.hotness || 0));

        const duration = Date.now() - startTime;
        console.log(`🔥 分类数据按热度排序完成 (${sortedByHotness.length} 条, 耗时: ${duration}ms)`);
        return sortedByHotness;
      }

      // 非分类模式：正常获取数据（按重要性排序）
      console.log('🌐 从API获取新数据...');
      const freshData = await this.fetchFromYuCoderAPI();

      const duration = Date.now() - startTime;
      console.log(`🆕 API数据获取完成 (${freshData.length} 条, 耗时: ${duration}ms)`);
      return freshData;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`API获取失败 (耗时: ${duration}ms):`, error);

      return this.getFallbackData();
    }
  }

  private async fetchFromYuCoderAPI(): Promise<ValueItem[]> {
    const apiUrl = 'https://api.yucoder.cn/api/hot/list';

    console.log('正在请求YuCoder API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; YuCoder-Scraper/1.0)',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API响应成功，开始处理数据...');

    if (data.code !== 0 || !data.data) {
      throw new Error('API返回数据格式错误');
    }

    return this.parseYuCoderData(data.data);
  }

  private parseYuCoderData(apiData: any[]): ValueItem[] {
    const valueItems: ValueItem[] = [];
    const usedIds = new Set<string>();

    // 处理所有数据源，不限制类型
    apiData.forEach(source => {
      if (source.data && Array.isArray(source.data)) {
        // 获取每个源的所有数据，不限制数量
        source.data.forEach((item: any, index: number) => {
          if (item.title && item.url) {
            // 生成唯一ID，包含时间戳和随机数确保唯一性
            let uniqueId = this.generateUniqueId(source.typeName, item.url, index);

            // 如果ID已存在，添加随机后缀直到唯一
            let suffix = 0;
            while (usedIds.has(uniqueId)) {
              uniqueId = `${this.generateUniqueId(source.typeName, item.url, index)}_${suffix}`;
              suffix++;
            }

            usedIds.add(uniqueId);

            const valueItem: ValueItem = {
              id: uniqueId,
              title: item.title,
              link: item.url,
              description: this.generateDescription(item, source.typeName),
              publishDate: source.updateTime ? new Date(source.updateTime).toISOString().split('T')[0] : undefined,
              importance: this.calculateImportance(item, source.typeName),
              hotness: item.followerCount || undefined,
              category: this.mapCategoryToCyberStyle(source.name),
              scrapedAt: new Date().toISOString(),
            };

            valueItems.push(valueItem);
            const category = this.mapCategoryToCyberStyle(source.name);
            console.log(`添加条目: [${source.name}] [${category}] ${item.title}`);
          }
        });
      }
    });

    // 按重要性排序
    return valueItems.sort((a, b) => b.importance - a.importance);
  }

  private generateUniqueId(sourceType: string, url: string, index: number): string {
    // 使用更复杂的ID生成算法，包含时间戳和哈希
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const hashInput = `${sourceType}_${url}_${index}_${timestamp}_${random}`;

    // 简单哈希函数
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(36);
  }

  private generateDescription(item: any, sourceType: string): string {
    const descriptions: { [key: string]: string } = {
      '知乎热榜': '知乎热门讨论话题',
      '微博热搜': '微博热搜话题',
      '虎扑步行街热榜': '虎扑社区热门讨论',
      '百度贴吧热榜': '百度贴吧热门话题',
      '编程热门': '编程导航热门内容',
      'CSDN热榜': 'CSDN技术博客热门文章',
      '掘金热榜': '掘金技术社区热门分享',
      'B站热门': '哔哩哔哩热门视频',
      '抖音热搜': '抖音热门短视频',
      '网易云热歌榜': '网易云音乐热门歌曲',
      'QQ音乐热歌榜': 'QQ音乐热门歌曲',
      '什么值得买热榜': '什么值得买好物推荐',
      '直播吧体育热榜': '直播吧体育热门资讯',
    };

    const baseDesc = descriptions[sourceType] || '热门内容';

    if (item.followerCount && item.followerCount > 0) {
      return `${baseDesc}，热度: ${this.formatCount(item.followerCount)}`;
    }

    return baseDesc;
  }

  private mapCategoryToCyberStyle(sourceName: string): string {
    // 直接使用API的sourceName作为分类，不再使用人工分类
    return sourceName || '未知来源';
  }

  private calculateImportance(item: any, sourceType: string): number {
    let importance = 3; // 降低基础分数，让热度数据起更大作用

    // 主要根据 followerCount（热度）计算重要性
    if (item.followerCount && item.followerCount > 0) {
      const count = item.followerCount;
      // 热度是主要评分标准，权重更高
      if (count > 10000000) importance += 6.5; // 1000万+
      else if (count > 5000000) importance += 6; // 500万+
      else if (count > 1000000) importance += 5; // 100万+
      else if (count > 500000) importance += 4; // 50万+
      else if (count > 100000) importance += 3; // 10万+
      else if (count > 50000) importance += 2; // 5万+
      else if (count > 10000) importance += 1; // 1万+
      else if (count > 5000) importance += 0.5; // 5000+
    }

    // 根据来源类型进行微调（减少权重）
    const highValueSources = ['微博热搜', '知乎热榜', 'B站热门', '抖音热搜'];
    const techSources = ['CSDN热榜', '掘金热榜', '编程热门'];
    const discussionSources = ['虎扑步行街热榜', '百度贴吧热榜'];
    const entertainmentSources = ['网易云热歌榜', 'QQ音乐热歌榜'];

    if (highValueSources.includes(sourceType)) {
      importance += 0.5; // 高价值来源小幅加分
    } else if (techSources.includes(sourceType)) {
      importance += 0.3; // 技术来源小幅加分
    } else if (discussionSources.includes(sourceType)) {
      importance += 0.2; // 讨论社区微调
    } else if (entertainmentSources.includes(sourceType)) {
      importance += 0.1; // 娱乐内容微调
    }
    // 其他来源不额外加分

    // 根据标题质量和时效性微调
    if (item.title) {
      const title = item.title.toLowerCase();
      // 热门关键词加分
      if (title.includes('热搜') || title.includes('爆') || title.includes('刷屏')) importance += 0.3;
      if (title.includes('最新') || title.includes('2024') || title.includes('2025')) importance += 0.2;
      if (title.includes('教程') || title.includes('学习') || title.includes('指南')) importance += 0.1;
      if (title.includes('重大') || title.includes('突发') || title.includes('紧急')) importance += 0.4;
    }

    return Math.min(Math.max(importance, 1), 10); // 确保分数在1-10之间
  }

  private formatCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  private getFallbackData(): ValueItem[] {
    console.log('使用演示数据模式');
    const demoData = getDemoData();
    console.log(`返回 ${demoData.length} 条演示数据`);
    return demoData;
  }
}
