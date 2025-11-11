import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { client } from '@/lib/redis';

// Helper function to ensure Redis client is available
function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not available');
  }
  return client;
}

// 记录阅读历史
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, title, link, category, description } = await request.json();

    if (!itemId || !title || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = session.user.id;
    const historyKey = `user:${userId}:history`;
    const itemKey = `history:${itemId}`;

    // 保存历史记录详情
    await getRedisClient().hset(itemKey, {
      id: itemId,
      title,
      link,
      category: category || '',
      description: description || '',
      visitedAt: new Date().toISOString()
    });

    // 添加到用户历史列表（使用 Sorted Set，按时间戳排序）
    const timestamp = Date.now();
    await getRedisClient().zadd(historyKey, { score: timestamp, member: itemId });

    // 设置过期时间（30天）
    await getRedisClient().expire(itemKey, 60 * 60 * 24 * 30);
    await getRedisClient().expire(historyKey, 60 * 60 * 24 * 30);

    return NextResponse.json({
      success: true,
      message: 'History recorded'
    });
  } catch (error) {
    console.error('记录历史失败:', error);
    return NextResponse.json(
      { error: '记录历史失败' },
      { status: 500 }
    );
  }
}

// 获取阅读历史
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const historyKey = `user:${userId}:history`;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // 获取最近的历史记录 ID（按时间倒序）
    const historyIds = await getRedisClient().zrange(historyKey, 0, limit - 1, { rev: true });

    if (!historyIds || historyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 获取每条历史记录的详情
    const historyItems = await Promise.all(
      historyIds.map(async (id) => {
        const itemKey = `history:${id}`;
        const item = await getRedisClient().hgetall(itemKey);
        return item;
      })
    );

    // 过滤掉空记录
    const validHistory = historyItems.filter(item => item && item.id);

    return NextResponse.json({
      success: true,
      data: validHistory
    });
  } catch (error) {
    console.error('获取历史失败:', error);
    return NextResponse.json(
      { error: '获取历史失败' },
      { status: 500 }
    );
  }
}

// 清除阅读历史
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const historyKey = `user:${userId}:history`;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (itemId) {
      // 删除单条历史记录
      await getRedisClient().zrem(historyKey, itemId);
      await getRedisClient().del(`history:${itemId}`);
    } else {
      // 清空所有历史
      const allIds = await getRedisClient().zrange(historyKey, 0, -1);

      // 删除所有详情
      if (allIds && allIds.length > 0) {
        await Promise.all(
          allIds.map(id => getRedisClient().del(`history:${id}`))
        );
      }

      // 删除历史列表
      await getRedisClient().del(historyKey);
    }

    return NextResponse.json({
      success: true,
      message: itemId ? 'Item removed' : 'History cleared'
    });
  } catch (error) {
    console.error('删除历史失败:', error);
    return NextResponse.json(
      { error: '删除历史失败' },
      { status: 500 }
    );
  }
}
