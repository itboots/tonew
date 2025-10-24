import { NextRequest, NextResponse } from 'next/server';
import { ScraperService } from '@/lib/scraper';
import { ScrapeResponse, ErrorType } from '@/types';
import { RedisCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    // 检查是否需要强制刷新和分页参数
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    console.log(`🔄 API 请求 - 强制刷新: ${forceRefresh}, 页码: ${page}, 每页: ${pageSize}`);

    let paginatedItems: any[] = [];
    let total = 0;
    let lastUpdate = null;
    let shouldUpdate = false;

    // 检查是否需要强制刷新或自动更新
    if (forceRefresh) {
      console.log('🔄 强制刷新：从API获取数据');
      const scraper = new ScraperService();
      const allItems = await scraper.scrapeAndProcess(true);

      // 存储到Redis
      await RedisCache.storeData(allItems, true);

      // 分页处理
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      paginatedItems = allItems.slice(startIndex, endIndex);
      total = allItems.length;
      lastUpdate = new Date().toISOString();
    } else {
      // 检查是否需要自动更新
      shouldUpdate = await RedisCache.shouldAutoUpdate();

      if (shouldUpdate) {
        console.log('⏰ 定时更新：从API获取数据');
        const scraper = new ScraperService();
        const allItems = await scraper.scrapeAndProcess(false);

        // 存储到Redis
        await RedisCache.storeData(allItems, false);

        // 分页处理
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        paginatedItems = allItems.slice(startIndex, endIndex);
        total = allItems.length;
        lastUpdate = new Date().toISOString();
      } else {
        // 普通刷新：从Redis读取分页数据
        console.log('📖 普通刷新：从Redis读取数据');
        const redisData = await RedisCache.getPagedData(page, pageSize);
        paginatedItems = redisData.items;
        total = redisData.total;
        lastUpdate = redisData.lastUpdate;
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
