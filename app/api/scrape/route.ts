import { NextRequest, NextResponse } from 'next/server';
import { ScraperService } from '@/lib/scraper';
import { ScrapeResponse, ErrorType } from '@/types';
import { RedisCache } from '@/lib/redis';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const DISMISSED_ITEMS_KEY = 'dismissed_items';

export async function GET(request: NextRequest) {
  try {
    // 检查是否需要强制刷新和分页参数
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const category = searchParams.get('category'); // 新增分类过滤参数
    const decodedCategory = category ? decodeURIComponent(category) : null; // 解码URL编码的中文字符

    console.log(`🔄 API 请求 - 强制刷新: ${forceRefresh}, 页码: ${page}, 每页: ${pageSize}, 分类: ${decodedCategory || '全部'}`);

    // 获取已滑掉的条目ID列表
    let dismissedIds: string[] = [];
    try {
      const ids = await redis.smembers(DISMISSED_ITEMS_KEY);
      dismissedIds = (ids || []) as string[];
      console.log(`🚫 已滑掉的条目数量: ${dismissedIds.length}`);
    } catch (error) {
      console.warn('⚠️ 获取已滑掉条目失败:', error);
    }

    // 过滤函数：移除已滑掉的条目
    const filterDismissed = (items: any[]) => {
      if (dismissedIds.length === 0) return items;
      return items.filter(item => !dismissedIds.includes(item.id));
    };

    
    let paginatedItems: any[] = [];
    let total = 0;
    let lastUpdate = null;
    let shouldUpdate = false;

    // 分类过滤时绕过Redis，直接获取最新数据并按热度排序
    if (decodedCategory) {
      console.log(`🔥 分类过滤模式：绕过Redis，直接获取 "${decodedCategory}" 最新数据并按热度排序`);
      const scraper = new ScraperService();
      const allItems = await scraper.scrapeAndProcess(false, decodedCategory);

      // 过滤已滑掉的条目
      const filteredItems = filterDismissed(allItems);
      console.log(`✅ 过滤后剩余 ${filteredItems.length} / ${allItems.length} 条`);

      // 分页处理
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      paginatedItems = filteredItems.slice(startIndex, endIndex);
      total = filteredItems.length;
      lastUpdate = new Date().toISOString();
      shouldUpdate = false; // 分类过滤不需要更新标志
    } else if (forceRefresh) {
      console.log('🔄 强制刷新：从API获取数据');
      const scraper = new ScraperService();
      const allItems = await scraper.scrapeAndProcess(true);

      // 过滤已滑掉的条目
      const filteredItems = filterDismissed(allItems);
      console.log(`✅ 过滤后剩余 ${filteredItems.length} / ${allItems.length} 条`);

      // 存储到Redis（如果可用）
      try {
        await RedisCache.storeData(filteredItems, true);
      } catch (redisError) {
        console.warn('⚠️ Redis存储失败，但继续返回数据:', redisError);
      }

      // 分页处理
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      paginatedItems = filteredItems.slice(startIndex, endIndex);
      total = filteredItems.length;
      lastUpdate = new Date().toISOString();
    } else {
      // 检查是否需要自动更新（仅限非分类模式）
      shouldUpdate = await RedisCache.shouldAutoUpdate();

      if (shouldUpdate) {
        console.log('⏰ 定时更新：从API获取数据');
        const scraper = new ScraperService();
        const allItems = await scraper.scrapeAndProcess(false);

        // 过滤已滑掉的条目
        const filteredItems = filterDismissed(allItems);
        console.log(`✅ 过滤后剩余 ${filteredItems.length} / ${allItems.length} 条`);

        // 存储到Redis（如果可用）
        try {
          await RedisCache.storeData(filteredItems, false);
        } catch (redisError) {
          console.warn('⚠️ Redis存储失败，但继续返回数据:', redisError);
        }

        // 分页处理
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        paginatedItems = filteredItems.slice(startIndex, endIndex);
        total = filteredItems.length;
        lastUpdate = new Date().toISOString();
      } else {
        // 普通刷新：从Redis读取分页数据
        console.log('📖 普通刷新：从Redis读取数据');
        const redisData = await RedisCache.getPagedData(page, pageSize);

        // 如果Redis没有数据，直接获取新数据
        if (redisData.items.length === 0) {
          console.log('⚠️ Redis无数据，直接获取新数据');
          const scraper = new ScraperService();
          const allItems = await scraper.scrapeAndProcess(false);

          // 过滤已滑掉的条目
          const filteredItems = filterDismissed(allItems);
          console.log(`✅ 过滤后剩余 ${filteredItems.length} / ${allItems.length} 条`);

          // 尝试存储到Redis
          try {
            await RedisCache.storeData(filteredItems, false);
          } catch (redisError) {
            console.warn('⚠️ Redis存储失败:', redisError);
          }

          // 分页处理
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          paginatedItems = filteredItems.slice(startIndex, endIndex);
          total = filteredItems.length;
          lastUpdate = new Date().toISOString();
        } else {
          // 从Redis获取数据（仅限非分类模式）
          paginatedItems = redisData.items;
          total = redisData.total;
          lastUpdate = redisData.lastUpdate;
        }
      }
    }

    const response: ScrapeResponse = {
      success: true,
      data: paginatedItems,
      timestamp: new Date().toISOString(),
      metadata: {
        forceRefresh,
        itemCount: paginatedItems.length,
        total,
        page,
        pageSize,
        hasMore: paginatedItems.length === pageSize,
        lastUpdate,
        shouldUpdate,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': forceRefresh ? 'no-cache, no-store, must-revalidate' : 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Scrape error:', error);

    let errorMessage = '爬取失败，请稍后重试';

    if (error.message === ErrorType.TIMEOUT_ERROR) {
      errorMessage = '请求超时，请检查网络连接';
    } else if (error.message === ErrorType.NETWORK_ERROR) {
      errorMessage = '网络错误，无法连接到目标网站';
    } else if (error.message === ErrorType.PARSE_ERROR) {
      errorMessage = '内容解析失败';
    }

    const response: ScrapeResponse = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}
