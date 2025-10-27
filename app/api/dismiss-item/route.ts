import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// 初始化 Redis 客户端
const redis = Redis.fromEnv();

const DISMISSED_ITEMS_KEY = 'dismissed_items';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: '缺少 itemId 参数' },
        { status: 400 }
      );
    }

    // 将滑掉的条目ID添加到Redis集合中
    await redis.sadd(DISMISSED_ITEMS_KEY, itemId);

    console.log(`✅ 条目 ${itemId} 已标记为已滑掉`);

    return NextResponse.json({
      success: true,
      message: '条目已标记为已滑掉',
      itemId,
    });
  } catch (error) {
    console.error('记录已滑掉条目失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '记录失败' 
      },
      { status: 500 }
    );
  }
}

// 获取所有已滑掉的条目ID
export async function GET(request: NextRequest) {
  try {
    const dismissedIds = await redis.smembers(DISMISSED_ITEMS_KEY);

    return NextResponse.json({
      success: true,
      data: dismissedIds || [],
      count: dismissedIds?.length || 0,
    });
  } catch (error) {
    console.error('获取已滑掉条目失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取失败' 
      },
      { status: 500 }
    );
  }
}

// 清空已滑掉的条目（可选，用于测试）
export async function DELETE(request: NextRequest) {
  try {
    await redis.del(DISMISSED_ITEMS_KEY);

    return NextResponse.json({
      success: true,
      message: '已清空所有已滑掉的条目',
    });
  } catch (error) {
    console.error('清空已滑掉条目失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '清空失败' 
      },
      { status: 500 }
    );
  }
}
