import { NextResponse } from 'next/server';
import { RedisCache } from '@/lib/redis';

export async function GET() {
  try {
    // 从 Redis 获取缓存的数据
    const cacheData = await RedisCache.getData();

    if (cacheData && cacheData.items && cacheData.items.length > 0) {
      // 从缓存数据中提取唯一分类
      const categories = [
        ...new Set(
          cacheData.items
            .map(item => item.category)
            .filter((category): category is string => Boolean(category))
        )
      ].sort();

      console.log(`📋 从缓存提取分类列表: ${categories.length} 个分类`);

      return NextResponse.json({
        success: true,
        data: categories,
        count: categories.length,
        timestamp: new Date().toISOString(),
      });
    }

    // 如果 Redis 没有数据，返回默认分类列表
    const defaultCategories = [
      'Java开发',
      '前端开发',
      'Python开发',
      '人工智能',
      '数据库',
      '算法',
      '运维部署',
      '后端开发',
      '硬件科技',
      '新能源',
      '通信技术',
      '职场求职',
      '商业财经',
      '政策规划',
      '教育话题',
      '社会热点',
      '娱乐八卦',
      '游戏动漫',
      '综合资讯',
    ];

    console.log('⚠️ Redis 无数据，返回默认分类列表');

    return NextResponse.json({
      success: true,
      data: defaultCategories,
      count: defaultCategories.length,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取分类列表失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
