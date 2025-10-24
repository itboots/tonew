import { NextResponse } from 'next/server';
import { RedisCache } from '@/lib/redis';

export async function GET() {
  try {
    const stats = await RedisCache.getCacheStats();

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ 获取缓存状态失败:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}