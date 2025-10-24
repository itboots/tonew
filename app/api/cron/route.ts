import { NextResponse } from 'next/server';
import { ScraperService } from '@/lib/scraper';
import { RedisCache } from '@/lib/redis';

export async function GET() {
  try {
    console.log('⏰ 定时任务开始 - 自动拉取数据');

    const scraper = new ScraperService();
    const items = await scraper.scrapeAndProcess(false); // 定时任务不强制刷新

    // 获取缓存统计信息
    const stats = await RedisCache.getCacheStats();

    console.log(`✅ 定时任务完成 - 获取到 ${items.length} 条数据`);
    console.log('📊 缓存统计:', stats);

    return NextResponse.json({
      success: true,
      message: '定时任务执行成功',
      itemCount: items.length,
      cacheStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ 定时任务执行失败:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// 支持 POST 方法用于手动触发
export async function POST() {
  return GET();
}