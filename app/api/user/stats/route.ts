import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { client } from '@/lib/redis';

// Helper function to ensure Redis client is available
function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not available');
  }
  return client;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 并行获取所有统计数据
    const [favoritesCount, historyCount, dismissedCount] = await Promise.all([
      // 收藏数量
      getRedisClient().scard(`user:${userId}:favorites`),
      // 历史记录数量
      getRedisClient().zcard(`user:${userId}:history`),
      // 已滑掉的数量
      getRedisClient().scard('dismissed_items')
    ]);

    // 获取用户加入日期（从用户数据中获取）
    const userKey = `user:${userId}`;
    const userData = await getRedisClient().hget(userKey, 'createdAt');

    const stats = {
      favoritesCount: favoritesCount || 0,
      historyCount: historyCount || 0,
      dismissedCount: dismissedCount || 0,
      joinedDate: userData || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
